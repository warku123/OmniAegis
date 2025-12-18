// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title StrategyRegistry
/// @notice 为每个用户存储风险监控与跨链防御策略配置
/// @dev 设计目标：
///      1. 仅用户自己（msg.sender）可以写自己的策略，读取为公开 view；
///      2. 拆分为「全局配置」+「按链阈值」，便于前端和 AI/后端消费；
///      3. 所有百分比类参数均使用整数（0-100 或 bps）避免浮点。
contract StrategyRegistry {
    /// @notice 全局风险偏好 / 跨链执行配置
    struct GlobalConfig {
        // 风险偏好：0 = 保守, 1 = 均衡, 2 = 激进
        uint8 riskMode;
        // 是否允许 AI 自动执行防御（否则仅提示 + 一键确认）
        bool autoExecute;
        // 是否优先保护稳定币 / 蓝筹资产（为后续 AI 决策预留）
        bool protectStablecoins;
        bool protectBlueChips;

        // 全局默认触发阈值（可被 per-chain 覆盖）
        uint8 defaultOverallThreshold; // 总体安全分低于多少触发 (0-100)
        uint8 defaultProtocolThreshold; // 协议风险高于多少触发 (0-100)
        uint8 defaultTransferRatio; // 建议调仓比例 (0-100, 单位 %)

        // 跨链落地点偏好
        uint256 primarySafeChainId; // 首选落地点链 ID（如 7001 = Zeta Athens）
        uint256 secondarySafeChainId; // 备选落地点链 ID（0 表示未设置）

        // 跨链规模与频率限制
        uint256 minCrossChainValueUsd; // 最小跨链规模（USD 估值，单位自定义）
        uint16 maxDailyExitCount; // 每日最大自动防御次数

        // 跨链执行约束（bps = 百分之几的万分比，1% = 100 bps）
        uint16 maxSlippageBps; // 最大滑点（如 100 = 1%）
        uint16 maxBridgeFeeBps; // 最大手续费占比

        // 执行通道偏好
        bool preferNativeBridgeOnly; // 是否只使用 ZetaChain 原生跨链通道

        // 标记是否已经初始化（便于前端/后端判断用户是否配置过）
        bool exists;
    }

    /// @notice 针对单条链的触发阈值
    struct ChainThreshold {
        uint8 overallThreshold; // 该链总体安全分低于多少触发 (0-100)
        uint8 protocolThreshold; // 该链协议风险高于多少触发 (0-100)
        uint8 transferRatio; // 触发时对该链持仓建议调仓比例 (0-100, 单位 %)
        bool exists; // 是否设置过该链的单独阈值
    }

    /// @notice 用户地址 => 全局配置
    mapping(address => GlobalConfig) private _globalConfigs;

    /// @notice 用户地址 => 链 ID => 阈值配置
    mapping(address => mapping(uint256 => ChainThreshold)) private _chainThresholds;

    /// @notice 事件：全局配置更新
    event GlobalConfigUpdated(address indexed user, GlobalConfig config);

    /// @notice 事件：某条链的阈值更新
    event ChainThresholdUpdated(
        address indexed user,
        uint256 indexed chainId,
        ChainThreshold threshold
    );

    /// @notice 设置/更新调用者自己的全局配置
    function setGlobalConfig(
        uint8 riskMode,
        bool autoExecute,
        bool protectStablecoins,
        bool protectBlueChips,
        uint8 defaultOverallThreshold,
        uint8 defaultProtocolThreshold,
        uint8 defaultTransferRatio,
        uint256 primarySafeChainId,
        uint256 secondarySafeChainId,
        uint256 minCrossChainValueUsd,
        uint16 maxDailyExitCount,
        uint16 maxSlippageBps,
        uint16 maxBridgeFeeBps,
        bool preferNativeBridgeOnly
    ) external {
        require(riskMode <= 2, "Invalid riskMode");
        require(defaultOverallThreshold <= 100, "Invalid overall threshold");
        require(defaultProtocolThreshold <= 100, "Invalid protocol threshold");
        require(defaultTransferRatio <= 100, "Invalid transfer ratio");

        GlobalConfig storage cfg = _globalConfigs[msg.sender];

        cfg.riskMode = riskMode;
        cfg.autoExecute = autoExecute;
        cfg.protectStablecoins = protectStablecoins;
        cfg.protectBlueChips = protectBlueChips;
        cfg.defaultOverallThreshold = defaultOverallThreshold;
        cfg.defaultProtocolThreshold = defaultProtocolThreshold;
        cfg.defaultTransferRatio = defaultTransferRatio;
        cfg.primarySafeChainId = primarySafeChainId;
        cfg.secondarySafeChainId = secondarySafeChainId;
        cfg.minCrossChainValueUsd = minCrossChainValueUsd;
        cfg.maxDailyExitCount = maxDailyExitCount;
        cfg.maxSlippageBps = maxSlippageBps;
        cfg.maxBridgeFeeBps = maxBridgeFeeBps;
        cfg.preferNativeBridgeOnly = preferNativeBridgeOnly;
        cfg.exists = true;

        emit GlobalConfigUpdated(msg.sender, cfg);
    }

    /// @notice 为调用者设置多条链的单独阈值（数组长度需一致）
    function setChainThresholds(
        uint256[] calldata chainIds,
        uint8[] calldata overallThresholds,
        uint8[] calldata protocolThresholds,
        uint8[] calldata transferRatios
    ) external {
        uint256 len = chainIds.length;
        require(
            len == overallThresholds.length &&
                len == protocolThresholds.length &&
                len == transferRatios.length,
            "Array length mismatch"
        );
        require(len > 0 && len <= 50, "Invalid batch size");

        for (uint256 i = 0; i < len; i++) {
            require(
                overallThresholds[i] <= 100 &&
                    protocolThresholds[i] <= 100 &&
                    transferRatios[i] <= 100,
                "Threshold out of range"
            );

            ChainThreshold storage th = _chainThresholds[msg.sender][
                chainIds[i]
            ];
            th.overallThreshold = overallThresholds[i];
            th.protocolThreshold = protocolThresholds[i];
            th.transferRatio = transferRatios[i];
            th.exists = true;

            emit ChainThresholdUpdated(msg.sender, chainIds[i], th);
        }
    }

    /// @notice 清除调用者在某条链上的单独阈值（回退到全局默认）
    function clearChainThreshold(uint256 chainId) external {
        delete _chainThresholds[msg.sender][chainId];
        emit ChainThresholdUpdated(
            msg.sender,
            chainId,
            _chainThresholds[msg.sender][chainId]
        );
    }

    /// @notice 读取某个用户的全局配置（AI/后端/前端使用）
    function getGlobalConfig(address user)
        external
        view
        returns (GlobalConfig memory)
    {
        return _globalConfigs[user];
    }

    /// @notice 读取某个用户在某条链上的单独阈值（如果未设置，exists = false）
    function getChainThreshold(address user, uint256 chainId)
        external
        view
        returns (ChainThreshold memory)
    {
        return _chainThresholds[user][chainId];
    }

    /// @notice 计算某个用户在某条链上的「生效」阈值（优先使用单独设置，否则回退全局默认）
    function getEffectiveThreshold(address user, uint256 chainId)
        external
        view
        returns (ChainThreshold memory)
    {
        ChainThreshold memory th = _chainThresholds[user][chainId];
        GlobalConfig memory cfg = _globalConfigs[user];

        if (!cfg.exists) {
            // 用户未配置任何策略，返回空
            return th;
        }

        if (!th.exists) {
            // 未设置单独阈值，则用全局默认填充
            th.overallThreshold = cfg.defaultOverallThreshold;
            th.protocolThreshold = cfg.defaultProtocolThreshold;
            th.transferRatio = cfg.defaultTransferRatio;
        }

        return th;
    }
}


