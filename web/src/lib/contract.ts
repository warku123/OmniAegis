// 合约 ABI 和地址配置
export const GUARDIAN_CONTRACT_ADDRESS =
  "0x91AdED71A60Ad8110F2F77cDd4AF70b3E01310a2";

export const SECURITY_REGISTRY_ADDRESS =
  "0x0472a36dC5497a4F8AB16bE37D235424484f7061";

export const STRATEGY_REGISTRY_ADDRESS: string =
  "0xE64D37DA141A8789FEf41da097C93b29E0Ffc197";

export const STRATEGY_REGISTRY_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "riskMode",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "autoExecute",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "protectStablecoins",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "protectBlueChips",
            type: "bool",
          },
          {
            internalType: "uint8",
            name: "defaultOverallThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "defaultProtocolThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "defaultTransferRatio",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "primarySafeChainId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "secondarySafeChainId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minCrossChainValueUsd",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "maxDailyExitCount",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "maxSlippageBps",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "maxBridgeFeeBps",
            type: "uint16",
          },
          {
            internalType: "bool",
            name: "preferNativeBridgeOnly",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct StrategyRegistry.GlobalConfig",
        name: "config",
        type: "tuple",
      },
    ],
    name: "GlobalConfigUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "overallThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "protocolThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "transferRatio",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        indexed: false,
        internalType: "struct StrategyRegistry.ChainThreshold",
        name: "threshold",
        type: "tuple",
      },
    ],
    name: "ChainThresholdUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "clearChainThreshold",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "getChainThreshold",
    outputs: [
      {
        components: [
          {
            internalType: "uint8",
            name: "overallThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "protocolThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "transferRatio",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        internalType: "struct StrategyRegistry.ChainThreshold",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "getEffectiveThreshold",
    outputs: [
      {
        components: [
          {
            internalType: "uint8",
            name: "overallThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "protocolThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "transferRatio",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        internalType: "struct StrategyRegistry.ChainThreshold",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getGlobalConfig",
    outputs: [
      {
        components: [
          {
            internalType: "uint8",
            name: "riskMode",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "autoExecute",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "protectStablecoins",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "protectBlueChips",
            type: "bool",
          },
          {
            internalType: "uint8",
            name: "defaultOverallThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "defaultProtocolThreshold",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "defaultTransferRatio",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "primarySafeChainId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "secondarySafeChainId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minCrossChainValueUsd",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "maxDailyExitCount",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "maxSlippageBps",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "maxBridgeFeeBps",
            type: "uint16",
          },
          {
            internalType: "bool",
            name: "preferNativeBridgeOnly",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        internalType: "struct StrategyRegistry.GlobalConfig",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "chainIds",
        type: "uint256[]",
      },
      {
        internalType: "uint8[]",
        name: "overallThresholds",
        type: "uint8[]",
      },
      {
        internalType: "uint8[]",
        name: "protocolThresholds",
        type: "uint8[]",
      },
      {
        internalType: "uint8[]",
        name: "transferRatios",
        type: "uint8[]",
      },
    ],
    name: "setChainThresholds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "riskMode",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "autoExecute",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "protectStablecoins",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "protectBlueChips",
        type: "bool",
      },
      {
        internalType: "uint8",
        name: "defaultOverallThreshold",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "defaultProtocolThreshold",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "defaultTransferRatio",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "primarySafeChainId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "secondarySafeChainId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minCrossChainValueUsd",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "maxDailyExitCount",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "maxSlippageBps",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "maxBridgeFeeBps",
        type: "uint16",
      },
      {
        internalType: "bool",
        name: "preferNativeBridgeOnly",
        type: "bool",
      },
    ],
    name: "setGlobalConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const GUARDIAN_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "guardian",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "actionType",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadata",
        type: "string",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "actionId",
        type: "uint256",
      },
    ],
    name: "DefenseExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "guardian",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "GuardianUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "actions",
    outputs: [
      {
        internalType: "address",
        name: "triggeredBy",
        type: "address",
      },
      {
        internalType: "string",
        name: "actionType",
        type: "string",
      },
      {
        internalType: "string",
        name: "metadata",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "actionType",
        type: "string",
      },
      {
        internalType: "string",
        name: "metadata",
        type: "string",
      },
    ],
    name: "executeDefense",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "metadata",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "polygonBalanceHint",
        type: "uint256",
      },
    ],
    name: "executeDefenseWithCrossChainExit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "actionId",
        type: "uint256",
      },
    ],
    name: "getAction",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "triggeredBy",
            type: "address",
          },
          {
            internalType: "string",
            name: "actionType",
            type: "string",
          },
          {
            internalType: "string",
            name: "metadata",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct OmniAegisGuardian.DefenseAction",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActionsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "guardians",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "guardian",
        type: "address",
      },
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    name: "setGuardian",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const SECURITY_REGISTRY_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "chainName",
        type: "string",
      },
    ],
    name: "ChainRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "updatedBy",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "overall",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "protocol",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "chain",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "market",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "social",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "gas",
            type: "uint8",
          },
        ],
        indexed: false,
        internalType: "struct SecurityRegistry.SecurityScore",
        name: "score",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "protocolCount",
            type: "uint16",
          },
          {
            internalType: "uint64",
            name: "totalValueLocked",
            type: "uint64",
          },
          {
            internalType: "uint8",
            name: "activeDefenses",
            type: "uint8",
          },
        ],
        indexed: false,
        internalType: "struct SecurityRegistry.ChainDetails",
        name: "details",
        type: "tuple",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "SecurityUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "updater",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "authorized",
        type: "bool",
      },
    ],
    name: "UpdaterAuthorized",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "authorizedUpdaters",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "chainIds",
        type: "uint256[]",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "overall",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "protocol",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "chain",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "market",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "social",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "gas",
            type: "uint8",
          },
        ],
        internalType: "struct SecurityRegistry.SecurityScore[]",
        name: "scores",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "protocolCount",
            type: "uint16",
          },
          {
            internalType: "uint64",
            name: "totalValueLocked",
            type: "uint64",
          },
          {
            internalType: "uint8",
            name: "activeDefenses",
            type: "uint8",
          },
        ],
        internalType: "struct SecurityRegistry.ChainDetails[]",
        name: "detailsArray",
        type: "tuple[]",
      },
    ],
    name: "batchUpdateChainSecurity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "chainSecurities",
    outputs: [
      {
        components: [
          {
            internalType: "uint8",
            name: "overall",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "protocol",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "chain",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "market",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "social",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "gas",
            type: "uint8",
          },
        ],
        internalType: "struct SecurityRegistry.SecurityScore",
        name: "score",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "protocolCount",
            type: "uint16",
          },
          {
            internalType: "uint64",
            name: "totalValueLocked",
            type: "uint64",
          },
          {
            internalType: "uint8",
            name: "activeDefenses",
            type: "uint8",
          },
        ],
        internalType: "struct SecurityRegistry.ChainDetails",
        name: "details",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "lastUpdated",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "updatedBy",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "getChainSecurity",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint8",
                name: "overall",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "protocol",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "chain",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "market",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "social",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "gas",
                type: "uint8",
              },
            ],
            internalType: "struct SecurityRegistry.SecurityScore",
            name: "score",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint16",
                name: "protocolCount",
                type: "uint16",
              },
              {
                internalType: "uint64",
                name: "totalValueLocked",
                type: "uint64",
              },
              {
                internalType: "uint8",
                name: "activeDefenses",
                type: "uint8",
              },
            ],
            internalType: "struct SecurityRegistry.ChainDetails",
            name: "details",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "lastUpdated",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "updatedBy",
            type: "address",
          },
        ],
        internalType: "struct SecurityRegistry.ChainSecurity",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "chainIds",
        type: "uint256[]",
      },
    ],
    name: "getMultipleChainSecurities",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint8",
                name: "overall",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "protocol",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "chain",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "market",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "social",
                type: "uint8",
              },
              {
                internalType: "uint8",
                name: "gas",
                type: "uint8",
              },
            ],
            internalType: "struct SecurityRegistry.SecurityScore",
            name: "score",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint16",
                name: "protocolCount",
                type: "uint16",
              },
              {
                internalType: "uint64",
                name: "totalValueLocked",
                type: "uint64",
              },
              {
                internalType: "uint8",
                name: "activeDefenses",
                type: "uint8",
              },
            ],
            internalType: "struct SecurityRegistry.ChainDetails",
            name: "details",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "lastUpdated",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "updatedBy",
            type: "address",
          },
        ],
        internalType: "struct SecurityRegistry.ChainSecurity[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSupportedChainCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "offset",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "getSupportedChainIds",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "isChainRegistered",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "chainName",
        type: "string",
      },
    ],
    name: "registerChain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "updater",
        type: "address",
      },
      {
        internalType: "bool",
        name: "authorized",
        type: "bool",
      },
    ],
    name: "setAuthorizedUpdater",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "supportedChainIds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "overall",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "protocol",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "chain",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "market",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "social",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "gas",
            type: "uint8",
          },
        ],
        internalType: "struct SecurityRegistry.SecurityScore",
        name: "score",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint16",
            name: "protocolCount",
            type: "uint16",
          },
          {
            internalType: "uint64",
            name: "totalValueLocked",
            type: "uint64",
          },
          {
            internalType: "uint8",
            name: "activeDefenses",
            type: "uint8",
          },
        ],
        internalType: "struct SecurityRegistry.ChainDetails",
        name: "details",
        type: "tuple",
      },
    ],
    name: "updateChainSecurity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

