// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct RevertOptions {
  bytes revertAddress;
  bytes revertMessage;
}

interface IGatewayZEVM {
  function withdraw(
    bytes calldata receiver,
    uint256 amount,
    address zrc20,
    RevertOptions calldata revertOptions
  ) external;
}

interface IZRC20 {
  function approve(address spender, uint256 value) external returns (bool);
  function balanceOf(address account) external view returns (uint256);
  function transferFrom(address from, address to, uint256 value) external returns (bool);
  // 获取目的链 gas 费和对应的 gas 代币地址
  function withdrawGasFee() external view returns (address, uint256);
}

contract ZetaToSepoliaTransfer {
  address public immutable gateway;
  address public immutable zetaZRC20;

  constructor(address _gateway, address _zetaZRC20) {
    gateway = _gateway;
    zetaZRC20 = _zetaZRC20;
  }

  function sendFixedZETAtoSepolia(address toSepolia) external {
    uint256 amount = 10_000_000_000_000_000; // 0.01 * 1e18
    
    // 1. 获取 Sepolia 的 Gas 费报价
    (address gasZRC20, uint256 gasFee) = IZRC20(zetaZRC20).withdrawGasFee();
    
    // 2. 从调用者拉取 0.01 ZETA
    require(IZRC20(zetaZRC20).transferFrom(msg.sender, address(this), amount), "ZETA transfer failed");
    
    // 3. 从调用者拉取所需的 Gas 费（Sepolia ETH ZRC-20）
    // 注意：调用前你需要确保你有足够的 Sepolia ETH ZRC-20 并授权给本合约
    require(IZRC20(gasZRC20).transferFrom(msg.sender, address(this), gasFee), "Gas fee transfer failed");

    // 4. 授权 Gateway 扣除 ZETA 和 Gas 费
    require(IZRC20(zetaZRC20).approve(gateway, amount), "approve ZETA failed");
    require(IZRC20(gasZRC20).approve(gateway, gasFee), "approve Gas failed");

    // 5. 构造提现参数
    bytes memory receiver = abi.encodePacked(toSepolia);
    RevertOptions memory ro = RevertOptions({
      revertAddress: abi.encodePacked(msg.sender),
      revertMessage: bytes("sepolia withdraw revert")
    });

    // 6. 发起提现
    IGatewayZEVM(gateway).withdraw(receiver, amount, zetaZRC20, ro);
  }
}