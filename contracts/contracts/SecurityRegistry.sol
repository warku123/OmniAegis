// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SecurityRegistry
/// @notice 存储和管理各条链的安全指数数据，支持 AI Agent 批量更新
///         设计考虑：
///         1. Gas 优化：只存储最新数据，历史通过事件查询
///         2. AI 集成：支持授权多个 AI Agent 地址来更新数据
///         3. 可扩展：支持任意链 ID，包括 Bitcoin (chainId = 0)
contract SecurityRegistry {
    address public owner;

    /// @notice 被授权可以更新安全数据的 AI Agent / 后端服务地址
    mapping(address => bool) public authorizedUpdaters;

    /// @notice 安全指数数据结构
    struct SecurityScore {
        uint8 overall;      // 总体安全指数 (0-100)
        uint8 protocol;      // 协议风险 (0-100, 越低越安全)
        uint8 chain;         // 链级风险 (0-100, 越低越安全)
        uint8 market;        // 市场波动风险 (0-100, 越低越安全)
        uint8 social;        // 社交信号风险 (0-100, 越低越安全)
        uint8 gas;           // Gas 稳定性 (0-100, 越高越稳定)
    }

    /// @notice 链上数据概览
    struct ChainDetails {
        uint16 protocolCount;    // 监控的协议数量
        uint64 totalValueLocked;  // TVL (单位: 百万美元，避免精度问题)
        uint8 activeDefenses;     // 活跃防御策略数量
    }

    /// @notice 每条链的完整安全数据
    struct ChainSecurity {
        SecurityScore score;
        ChainDetails details;
        uint256 lastUpdated;      // 最后更新时间戳
        address updatedBy;        // 最后更新者（AI Agent 地址）
    }

    /// @notice 链 ID => 安全数据
    mapping(uint256 => ChainSecurity) public chainSecurities;

    /// @notice 支持的链 ID 列表（用于前端遍历）
    uint256[] public supportedChainIds;

    /// @notice 记录链是否已注册
    mapping(uint256 => bool) public isChainRegistered;

    /// @notice 事件：授权/取消授权更新者
    event UpdaterAuthorized(address indexed updater, bool authorized);

    /// @notice 事件：安全数据更新（前端可以监听这个事件来获取历史数据）
    event SecurityUpdated(
        uint256 indexed chainId,
        address indexed updatedBy,
        SecurityScore score,
        ChainDetails details,
        uint256 timestamp
    );

    /// @notice 事件：新链注册
    event ChainRegistered(uint256 indexed chainId, string chainName);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            authorizedUpdaters[msg.sender] || msg.sender == owner,
            "Not authorized"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedUpdaters[msg.sender] = true;
        emit UpdaterAuthorized(msg.sender, true);
    }

    /// @notice 授权/取消授权 AI Agent 更新数据
    function setAuthorizedUpdater(address updater, bool authorized)
        external
        onlyOwner
    {
        authorizedUpdaters[updater] = authorized;
        emit UpdaterAuthorized(updater, authorized);
    }

    /// @notice 注册新链（可选，首次更新时会自动注册）
    function registerChain(uint256 chainId, string calldata chainName)
        external
        onlyOwner
    {
        require(!isChainRegistered[chainId], "Chain already registered");
        isChainRegistered[chainId] = true;
        supportedChainIds.push(chainId);
        emit ChainRegistered(chainId, chainName);
    }

    /// @notice 移除一条链的安全数据（仅 owner，可用于下线错误或不再支持的链）
    /// @dev 从 mapping 中删除安全数据，并从 supportedChainIds 数组中移除对应的链 ID。
    function removeChain(uint256 chainId) external onlyOwner {
        require(isChainRegistered[chainId], "Chain not registered");

        // 1. 取消注册标记
        isChainRegistered[chainId] = false;

        // 2. 删除安全数据
        delete chainSecurities[chainId];

        // 3. 从 supportedChainIds 中移除（swap & pop）
        uint256 length = supportedChainIds.length;
        for (uint256 i = 0; i < length; i++) {
            if (supportedChainIds[i] == chainId) {
                // 用最后一个元素覆盖当前下标
                if (i != length - 1) {
                    supportedChainIds[i] = supportedChainIds[length - 1];
                }
                supportedChainIds.pop();
                break;
            }
        }
    }

    /// @notice 更新单条链的安全数据（AI Agent 调用）
    function updateChainSecurity(
        uint256 chainId,
        SecurityScore calldata score,
        ChainDetails calldata details
    ) external onlyAuthorized {
        // 如果是新链，自动注册
        if (!isChainRegistered[chainId]) {
            isChainRegistered[chainId] = true;
            supportedChainIds.push(chainId);
        }

        chainSecurities[chainId] = ChainSecurity({
            score: score,
            details: details,
            lastUpdated: block.timestamp,
            updatedBy: msg.sender
        });

        emit SecurityUpdated(
            chainId,
            msg.sender,
            score,
            details,
            block.timestamp
        );
    }

    /// @notice 批量更新多条链的安全数据（AI Agent 调用，Gas 更高效）
    /// @param chainIds 链 ID 数组
    /// @param scores 对应的安全指数数组
    /// @param detailsArray 对应的链上数据数组
    function batchUpdateChainSecurity(
        uint256[] calldata chainIds,
        SecurityScore[] calldata scores,
        ChainDetails[] calldata detailsArray
    ) external onlyAuthorized {
        require(
            chainIds.length == scores.length &&
                scores.length == detailsArray.length,
            "Array length mismatch"
        );
        require(chainIds.length > 0 && chainIds.length <= 20, "Invalid batch size");

        for (uint256 i = 0; i < chainIds.length; i++) {
            uint256 chainId = chainIds[i];

            // 如果是新链，自动注册
            if (!isChainRegistered[chainId]) {
                isChainRegistered[chainId] = true;
                supportedChainIds.push(chainId);
            }

            chainSecurities[chainId] = ChainSecurity({
                score: scores[i],
                details: detailsArray[i],
                lastUpdated: block.timestamp,
                updatedBy: msg.sender
            });

            emit SecurityUpdated(
                chainId,
                msg.sender,
                scores[i],
                detailsArray[i],
                block.timestamp
            );
        }
    }

    /// @notice 获取单条链的安全数据
    function getChainSecurity(uint256 chainId)
        external
        view
        returns (ChainSecurity memory)
    {
        require(isChainRegistered[chainId], "Chain not registered");
        return chainSecurities[chainId];
    }

    /// @notice 获取多条链的安全数据（前端批量查询）
    function getMultipleChainSecurities(uint256[] calldata chainIds)
        external
        view
        returns (ChainSecurity[] memory)
    {
        ChainSecurity[] memory results = new ChainSecurity[](chainIds.length);
        for (uint256 i = 0; i < chainIds.length; i++) {
            if (isChainRegistered[chainIds[i]]) {
                results[i] = chainSecurities[chainIds[i]];
            }
        }
        return results;
    }

    /// @notice 获取所有已注册的链 ID 数量
    function getSupportedChainCount() external view returns (uint256) {
        return supportedChainIds.length;
    }

    /// @notice 获取所有已注册的链 ID（分页查询，避免 Gas 过高）
    function getSupportedChainIds(uint256 offset, uint256 limit)
        external
        view
        returns (uint256[] memory)
    {
        require(offset < supportedChainIds.length, "Offset out of range");
        uint256 end = offset + limit;
        if (end > supportedChainIds.length) {
            end = supportedChainIds.length;
        }
        uint256[] memory result = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = supportedChainIds[i];
        }
        return result;
    }
}

