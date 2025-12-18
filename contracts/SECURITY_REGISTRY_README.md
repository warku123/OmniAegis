# SecurityRegistry 合约设计文档

## 📋 概述

`SecurityRegistry` 是一个专门存储和管理各条链安全指数的智能合约，设计用于对接 AI 生成的安全数据。

## 🎯 设计目标

1. **Gas 优化**：只存储最新数据，历史数据通过事件查询
2. **AI 集成**：支持授权多个 AI Agent 地址来批量更新数据
3. **可扩展性**：支持任意链 ID（包括 Bitcoin，chainId = 0）
4. **批量操作**：支持一次交易更新多条链，降低 Gas 成本

## 📊 数据结构

### SecurityScore（安全指数）

```solidity
struct SecurityScore {
    uint8 overall;      // 总体安全指数 (0-100)
    uint8 protocol;     // 协议风险 (0-100, 越低越安全)
    uint8 chain;        // 链级风险 (0-100, 越低越安全)
    uint8 market;        // 市场波动风险 (0-100, 越低越安全)
    uint8 social;        // 社交信号风险 (0-100, 越低越安全)
    uint8 gas;           // Gas 稳定性 (0-100, 越高越稳定)
}
```

### ChainDetails（链上数据）

```solidity
struct ChainDetails {
    uint16 protocolCount;    // 监控的协议数量
    uint64 totalValueLocked; // TVL (单位: 百万美元)
    uint8 activeDefenses;    // 活跃防御策略数量
}
```

## 🔐 权限管理

- **Owner**：合约部署者，可以授权/取消授权 AI Agent
- **Authorized Updaters**：被授权的 AI Agent 地址，可以更新安全数据

## 🚀 核心功能

### 1. 授权 AI Agent

```solidity
function setAuthorizedUpdater(address updater, bool authorized)
```

只有 owner 可以调用，用于授权 AI Agent 地址。

### 2. 更新单条链安全数据

```solidity
function updateChainSecurity(
    uint256 chainId,
    SecurityScore calldata score,
    ChainDetails calldata details
)
```

AI Agent 调用，更新单条链的数据。

### 3. 批量更新多条链（推荐）

```solidity
function batchUpdateChainSecurity(
    uint256[] calldata chainIds,
    SecurityScore[] calldata scores,
    ChainDetails[] calldata detailsArray
)
```

**推荐使用**：AI Agent 可以一次更新最多 20 条链，Gas 成本更低。

### 4. 查询功能

- `getChainSecurity(uint256 chainId)`：获取单条链数据
- `getMultipleChainSecurities(uint256[] chainIds)`：批量获取多条链数据
- `getSupportedChainIds(uint256 offset, uint256 limit)`：分页获取所有链 ID

## 📡 事件

### SecurityUpdated

每次更新安全数据时发出，前端可以监听这个事件来获取历史数据：

```solidity
event SecurityUpdated(
    uint256 indexed chainId,
    address indexed updatedBy,
    SecurityScore score,
    ChainDetails details,
    uint256 timestamp
);
```

## 🔄 AI 集成流程

### 步骤 1：部署合约

```bash
cd contracts
npm run deploy:security
```

### 步骤 2：授权 AI Agent

Owner 调用 `setAuthorizedUpdater(aiAgentAddress, true)`

### 步骤 3：AI Agent 更新数据

AI Agent 定期（例如每 5 分钟）调用 `batchUpdateChainSecurity` 更新所有链的安全数据。

**示例流程**：

1. AI 模型分析链上数据、市场数据、社交数据
2. 生成各条链的 `SecurityScore` 和 `ChainDetails`
3. 调用 `batchUpdateChainSecurity` 批量写入链上
4. 前端监听 `SecurityUpdated` 事件，实时更新 UI

## 💡 Gas 成本估算

- **单次更新 1 条链**：~50,000 gas
- **批量更新 5 条链**：~150,000 gas（比单次更新 5 次节省约 40%）
- **批量更新 20 条链**：~500,000 gas

## 🔮 未来扩展

1. **历史版本存储**：如果需要保留历史版本，可以添加 `mapping(uint256 => ChainSecurity[])` 存储历史
2. **多签名验证**：可以添加多签名机制，要求多个 AI Agent 签名才能更新
3. **预言机集成**：可以集成 Chainlink 等预言机来验证 AI 生成的数据
4. **时间加权平均**：可以计算最近 N 次更新的加权平均，平滑波动

## 📝 使用示例

### 部署合约

```bash
npm run deploy:security
```

### 授权 AI Agent

```typescript
const registry = await ethers.getContractAt("SecurityRegistry", address);
await registry.setAuthorizedUpdater(aiAgentAddress, true);
```

### AI Agent 批量更新

```typescript
const chainIds = [1, 7001, 137];
const scores = [
  { overall: 78, protocol: 32, chain: 15, market: 45, social: 20, gas: 65 },
  // ...
];
const details = [
  { protocolCount: 12, totalValueLocked: 2400, activeDefenses: 3 },
  // ...
];

await registry.batchUpdateChainSecurity(chainIds, scores, details);
```

### 前端查询

```typescript
const security = await registry.getChainSecurity(1); // Ethereum
console.log(security.score.overall); // 78
```

## 🎯 与前端集成

前端 `/security` 页面可以：

1. **实时查询**：调用 `getMultipleChainSecurities` 获取所有链的最新数据
2. **监听事件**：监听 `SecurityUpdated` 事件，实时更新 UI
3. **历史查询**：通过事件日志查询历史更新记录

