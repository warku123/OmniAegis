## OmniAegis 合约说明（ZetaChain Testnet）

本目录是 OmniAegis 在 **ZetaChain Athens Testnet** 上的合约工程，负责实现：

- `OmniAegisGuardian`：防御动作记录与触发
- `SecurityRegistry`：全链安全指数存储与查询

它们共同为前端仪表盘和 AI 风控 Agent 提供稳定的、可审计的链上基础设施。

---

## 0. 环境依赖

- Node.js：建议使用 **LTS 版本（>= 18，推荐 22 LTS）**
- npm
- 一个支持 EVM 的钱包（如 MetaMask），并已添加 **ZetaChain Athens Testnet**
  - RPC: `https://zetachain-athens-evm.blockpi.network/v1/rpc/public`
  - Chain ID: `7001`
  - 币种: `ZETA`
  - Explorer: `https://zetachain-athens-3.blockscout.com`
- 测试网钱包私钥（需要有少量 ZETA 作为 Gas）

---

## 1. 安装依赖 & 配置环境

在仓库根目录：

```bash
cd contracts
npm install
```

在 `contracts` 目录下创建 `.env` 文件（**不要提交到 Git**）：

```bash
cd contracts
cat > .env << 'EOF'
ZETA_PRIVATE_KEY=0x你的测试网私钥（不要用主网钱包）
ZETA_EXPLORER_API_KEY=          # 可选，Blockscout API Key，可留空
SECURITY_REGISTRY_ADDRESS=      # 部署完 SecurityRegistry 后填入
EOF
```

> - `ZETA_PRIVATE_KEY` 是 EOA 私钥，不带引号，形如 `0xabc123...`  
> - 建议单独新建一个测试钱包，只往里面充测试网 ZETA

---

## 2. 合约概览

### 2.1 `OmniAegisGuardian.sol` —— 防御控制器

> 「AI 风控 / 后端在链上的防御入口」

- **作用**
  - 记录每一次「防御动作」，比如：
    - 从高风险链发起跨链退出（`CROSS_CHAIN_EXIT`）
    - 为用户购买保险（`BUY_INSURANCE`）
  - 为前端仪表盘提供可视化的防御历史列表。

- **核心状态**
  - `address owner`：合约所有者（部署者）
  - `mapping(address => bool) guardians`：有权限触发防御的地址（AI Agent / 后端服务等）
  - `DefenseAction[] actions`：防御动作历史

- **核心结构体（简化）**

  ```solidity
  struct DefenseAction {
      address triggeredBy;
      string  actionType; // "CROSS_CHAIN_EXIT" / "BUY_INSURANCE" ...
      string  metadata;   // JSON 字符串，记录细节（仓位、风险分、目标链等）
      uint256 timestamp;
  }
  ```

- **关键方法**
  - `setGuardian(address guardian, bool allowed)`  
    仅 `owner` 可调用，用于授予/撤销某个地址的 guardian 权限。
  - `executeDefense(string actionType, string metadata)`  
    仅 guardian 可调用，记录一次防御动作并触发 `DefenseExecuted` 事件。
  - `getActionsCount()` / `getAction(uint256 id)`  
    前端在 `/dashboard` 页面中用来读取历史记录。

- **部署脚本**
  - `scripts/deploy-guardian.ts`：在 ZetaChain Testnet 上部署 `OmniAegisGuardian`。

---

### 2.2 `SecurityRegistry.sol` —— 全链安全指数注册表

> 「AI / 后端生成的多链安全评分的链上数据源，前端 `/security` 页面只读这个合约」

- **作用**
  - 为每条链维护一份「安全画像」：
    - 总体安全指数 `overall`
    - 协议风险、链级风险、市场波动、社交信号、Gas 稳定性等子指标
    - 监控协议数量、TVL、活跃防御策略数等统计数据
  - 允许一组被授权的更新者（AI / 后端）批量写入数据。

- **核心结构体（概念版）**

  ```solidity
  struct SecurityScore {
      uint8 overall;   // 0-100，越大越安全
      uint8 protocol;  // 协议风险，越低越安全
      uint8 chain;     // 链级风险
      uint8 market;    // 市场波动风险
      uint8 social;    // 社交信号风险
      uint8 gas;       // Gas 稳定性（越高越稳定）
  }

  struct ChainDetails {
      uint16 protocolCount;     // 监控协议数
      uint64 totalValueLocked;  // TVL（单位：百万美元）
      uint8  activeDefenses;    // 当前活跃防御策略数
  }

  struct ChainSecurity {
      SecurityScore score;
      ChainDetails  details;
      uint256       lastUpdated;
      address       updatedBy;
  }
  ```

- **权限控制**
  - `owner`：合约拥有者，可以：
    - 设置/取消 `authorizedUpdaters`
  - `authorizedUpdaters[address] == true`：
    - 可以调用 `updateChainSecurity` / `batchUpdateChainSecurity`
  - 其他地址：只能读，不能写。

- **关键方法（高层说明）**
  - `setAuthorizedUpdater(address updater, bool authorized)`：配置可以写入安全数据的钱包地址。
  - `updateChainSecurity(chainId, score, details)`：更新单条链安全数据。
  - `batchUpdateChainSecurity(chainIds[], scores[], detailsArray[])`：批量更新多条链。
  - `getChainSecurity(chainId)`：获取某条链的当前安全数据。
  - `getMultipleChainSecurities(chainIds[])`：批量读取，前端一次性拉全部。
  - `getSupportedChainIds(offset, limit)` / `getSupportedChainCount()`：分页遍历所有链 ID。

- **脚本与文档**
  - `scripts/deploy-security-registry.ts`：部署 `SecurityRegistry`。
  - `scripts/demo-update-security.ts`：示例脚本，模拟 AI 批量更新多条链的安全指标。
  - `SECURITY_REGISTRY_README.md`：更详细的设计说明与 AI 集成文档。

---

## 3. 编译合约

```bash
cd contracts
npm run compile
```

看到类似输出：

- `Compiled X Solidity files successfully`  
说明编译成功。

---

## 4. 部署到 ZetaChain Athens Testnet

### 4.1 部署防御控制器 `OmniAegisGuardian`

```bash
cd contracts
npm run deploy:zetachain
```

示例输出：

```text
部署账户: 0xYourAddress...
账户余额: 0.1234 ZETA
正在部署 OmniAegisGuardian 合约...
OmniAegisGuardian 部署成功，地址: 0x<GUARDIAN_ADDRESS>
```

把 `0x<GUARDIAN_ADDRESS>` 复制到前端 `web/src/lib/contract.ts` 对应常量中，  
前端 `/dashboard` 页面就可以：

- 检查当前用户是否为 `guardian` / `owner`
- 触发 `executeDefense` 记录防御动作
- 展示防御历史记录

### 4.2 部署安全指数注册表 `SecurityRegistry`

```bash
cd contracts
npm run deploy:security
```

示例输出：

```text
部署账户: 0xYourAddress...
账户余额: 3.09 ZETA
正在部署 SecurityRegistry 合约...
SecurityRegistry 部署成功，地址: 0x<REGISTRY_ADDRESS>
在 Blockscout 查看: https://zetachain-athens-3.blockscout.com/address/0x<REGISTRY_ADDRESS>
```

然后：

1. 将 `0x<REGISTRY_ADDRESS>` 写入 `.env` 的 `SECURITY_REGISTRY_ADDRESS`  
2. 同时更新前端 `web/src/lib/contract.ts` 的 `SECURITY_REGISTRY_ADDRESS` 常量  
3. 前端 `/security` 页面会通过 `useSecurityRegistry` 只读这个合约的数据，不再使用任何 mock。

---

## 5. AI / 后端 如何写入安全指数？

1. **为 AI 钱包地址授权**

   使用 owner 地址（即部署者）执行一次：

   ```ts
   const registry = await ethers.getContractAt(
     "SecurityRegistry",
     "0x<REGISTRY_ADDRESS>"
   );
   await registry.setAuthorizedUpdater("0x<AI_AGENT_ADDRESS>", true);
   ```

2. **在 `.env` 中使用 AI 钱包私钥**

   ```env
   ZETA_PRIVATE_KEY=0x你的AI钱包私钥
   SECURITY_REGISTRY_ADDRESS=0x<REGISTRY_ADDRESS>
   ```

3. **通过脚本批量更新安全分**

   直接运行示例脚本：

   ```bash
   cd contracts
   npx hardhat run scripts/demo-update-security.ts --network zetachainTestnet
   ```

   该脚本会以 `ZETA_PRIVATE_KEY` 对应的钱包为 `msg.sender` 调用  
   `batchUpdateChainSecurity`，成功前提是该地址已在合约中被授权。

4. **前端读取**

   前端 `/security` 页面在浏览器中调用的是 `eth_call`（只读 RPC），  
   所以不会弹钱包签名，也不会消耗 Gas；写入动作全部由后端/脚本负责。

---

## 6. 区块浏览器查看与手动调试

部署成功后，可以在 Blockscout 打开：

```text
https://zetachain-athens-3.blockscout.com/address/你的合约地址
```

你可以：

- 在「Read Contract」面板里查看当前链上状态；
- 在「Write Contract」面板里手动调用：
  - `executeDefense`（OmniAegisGuardian）
  - `setAuthorizedUpdater`
  - `updateChainSecurity` / `batchUpdateChainSecurity`

非常适合在没有前端时快速验证合约行为。

---

## 7. 常用命令速查

```bash
# 进入合约工程
cd /Users/zhangpinge/zeta/OmniAegis/contracts

# 1）安装依赖（第一次）
npm install

# 2）编译所有合约
npm run compile

# 3）部署防御控制器到 ZetaChain 测试网
npm run deploy:zetachain

# 4）部署安全指数注册表到 ZetaChain 测试网
npm run deploy:security
```

如果你后续想要：

- 接入真实 AI 模型，周期性写入多链安全分；  
- 或在前端增加历史趋势图 / 风险事件时间线；  

我也可以基于现在这套合约设计继续帮你扩展。


