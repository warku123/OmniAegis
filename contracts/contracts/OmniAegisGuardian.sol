// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title OmniAegisGuardian
/// @notice 防御控制器，用于在 ZetaChain Testnet 上记录防御动作
///         由前端 / off-chain AI 触发的防御操作入口
contract OmniAegisGuardian {
    address public owner;

    /// @notice 可以被授权触发防御动作的“守护者”（例如：AI 代理、后端服务）
    mapping(address => bool) public guardians;

    /// @notice 记录一次防御动作，用于前端展示
    struct DefenseAction {
        address triggeredBy;
        string actionType; // e.g. "CROSS_CHAIN_EXIT", "BUY_INSURANCE"
        string metadata; // JSON 或任意描述字符串
        uint256 timestamp;
    }

    DefenseAction[] public actions;

    event GuardianUpdated(address guardian, bool allowed);
    event DefenseExecuted(
        address indexed guardian,
        string actionType,
        string metadata,
        uint256 indexed actionId
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyGuardian() {
        require(guardians[msg.sender], "Not guardian");
        _;
    }

    constructor() {
        owner = msg.sender;
        guardians[msg.sender] = true;
        emit GuardianUpdated(msg.sender, true);
    }

    /// @notice 设置/取消守护者权限
    function setGuardian(address guardian, bool allowed) external onlyOwner {
        guardians[guardian] = allowed;
        emit GuardianUpdated(guardian, allowed);
    }

    /// @notice 记录一次“防御策略执行”
    /// @param actionType 文本类型标记，如 "CROSS_CHAIN_EXIT"
    /// @param metadata 详细信息（可用 JSON 字符串存放多链仓位、风险评分等）
    function executeDefense(
        string calldata actionType,
        string calldata metadata
    ) external onlyGuardian {
        DefenseAction memory action = DefenseAction({
            triggeredBy: msg.sender,
            actionType: actionType,
            metadata: metadata,
            timestamp: block.timestamp
        });

        actions.push(action);
        emit DefenseExecuted(
            msg.sender,
            actionType,
            metadata,
            actions.length - 1
        );
    }

    /// @notice 记录跨链退出防御动作
    /// @dev 只记录防御动作，跨链执行由前端直接调用 Polygon 合约执行
    /// @param metadata 前端/AI 生成的 JSON 字符串快照
    function executeDefenseWithCrossChainExit(
        string calldata metadata,
        uint256 /* polygonBalanceHint - 保留参数以兼容前端调用 */
    ) external onlyGuardian {
        // 记录防御动作
        DefenseAction memory action = DefenseAction({
            triggeredBy: msg.sender,
            actionType: "CROSS_CHAIN_EXIT",
            metadata: metadata,
            timestamp: block.timestamp
        });

        actions.push(action);
        emit DefenseExecuted(
            msg.sender,
            "CROSS_CHAIN_EXIT",
            metadata,
            actions.length - 1
        );
    }

    function getActionsCount() external view returns (uint256) {
        return actions.length;
    }

    function getAction(
        uint256 actionId
    ) external view returns (DefenseAction memory) {
        require(actionId < actions.length, "Invalid id");
        return actions[actionId];
    }
}


