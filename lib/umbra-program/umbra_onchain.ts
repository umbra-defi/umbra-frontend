/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/umbra_onchain.json`.
 */
export type UmbraOnchain = {
  "address": "DkZan98sELEKEwT2KwnjDKbMcw9Cekf35jru94oVN1s7",
  "metadata": {
    "name": "umbraOnchain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Arcium & Anchor"
  },
  "instructions": [
    {
      "name": "claimTransfer",
      "discriminator": [
        202,
        178,
        58,
        190,
        230,
        234,
        229,
        17
      ],
      "accounts": [
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "mint"
        },
        {
          "name": "umbraPda"
        },
        {
          "name": "umbraAtaAccount",
          "writable": true
        },
        {
          "name": "receiverAtaAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createRelayer",
      "discriminator": [
        237,
        140,
        242,
        158,
        223,
        25,
        138,
        165
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayer",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "relayerPubkey",
          "type": {
            "defined": {
              "name": "walletPublicKey"
            }
          }
        },
        {
          "name": "relayerFee",
          "type": {
            "defined": {
              "name": "relayerFee"
            }
          }
        },
        {
          "name": "associatedToken",
          "type": {
            "defined": {
              "name": "mintAddress"
            }
          }
        },
        {
          "name": "uniqueIdentifier",
          "type": {
            "defined": {
              "name": "uniqueIdentifier"
            }
          }
        }
      ]
    },
    {
      "name": "createTokenAccount",
      "discriminator": [
        147,
        241,
        123,
        100,
        244,
        132,
        174,
        118
      ],
      "accounts": [
        {
          "name": "userAccount"
        },
        {
          "name": "tokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  85,
                  109,
                  98,
                  114,
                  97,
                  95,
                  67,
                  97,
                  108,
                  95,
                  80,
                  114,
                  97,
                  110,
                  97,
                  121,
                  95,
                  70,
                  114,
                  111,
                  103,
                  103,
                  105,
                  101,
                  95,
                  80,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  84,
                  111,
                  107,
                  101,
                  110,
                  95,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "userAccount"
              },
              {
                "kind": "arg",
                "path": "mint_token_address.0"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayer"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "mintTokenAddress",
          "type": {
            "defined": {
              "name": "mintAddress"
            }
          }
        },
        {
          "name": "balance",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "x25519Nonce"
            }
          }
        }
      ]
    },
    {
      "name": "createUserAccount",
      "discriminator": [
        146,
        68,
        100,
        69,
        63,
        46,
        182,
        199
      ],
      "accounts": [
        {
          "name": "userAccount",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "relayer"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "umbraAddress",
          "type": {
            "defined": {
              "name": "umbraAddress"
            }
          }
        },
        {
          "name": "encryptionPubkey",
          "type": {
            "defined": {
              "name": "x25519PublicKey"
            }
          }
        }
      ]
    },
    {
      "name": "depositAmount",
      "discriminator": [
        220,
        131,
        39,
        220,
        179,
        247,
        241,
        22
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "DXHqHhBGNM58RLk438UiEbGe9137A7zJc6JHKN3qMZoB"
        },
        {
          "name": "clockAccount",
          "address": "FHriyvoZotYiFnbUzKFjzRSb2NiaC8RPWY7jtKuKhg65"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "relayer"
        },
        {
          "name": "userAccount",
          "writable": true
        },
        {
          "name": "tokenAccount"
        }
      ],
      "args": [
        {
          "name": "depositAmount",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "x25519Nonce"
            }
          }
        },
        {
          "name": "computationOffset",
          "type": "u64"
        }
      ]
    },
    {
      "name": "depositAmountCallback",
      "discriminator": [
        243,
        11,
        230,
        57,
        159,
        34,
        153,
        11
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "tokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "output",
          "type": {
            "defined": {
              "name": "computationOutputs"
            }
          }
        }
      ]
    },
    {
      "name": "initDepositAmountCompDef",
      "discriminator": [
        235,
        29,
        183,
        69,
        51,
        175,
        106,
        168
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initTransferAmountCompDef",
      "discriminator": [
        220,
        227,
        130,
        57,
        226,
        179,
        227,
        57
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initWithdrawAmountCompDef",
      "discriminator": [
        199,
        134,
        10,
        84,
        36,
        64,
        50,
        99
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "transferAmount",
      "discriminator": [
        217,
        57,
        139,
        98,
        106,
        41,
        37,
        200
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "DXHqHhBGNM58RLk438UiEbGe9137A7zJc6JHKN3qMZoB"
        },
        {
          "name": "clockAccount",
          "address": "FHriyvoZotYiFnbUzKFjzRSb2NiaC8RPWY7jtKuKhg65"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "senderUserAccount",
          "writable": true
        },
        {
          "name": "tokenAccountSender"
        },
        {
          "name": "receiverUserAccount",
          "writable": true
        },
        {
          "name": "tokenAccountReceiver"
        }
      ],
      "args": [
        {
          "name": "transferAmount",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "computationOffset",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferAmountCallback",
      "discriminator": [
        145,
        49,
        230,
        223,
        164,
        146,
        201,
        203
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "tokenAccountSender",
          "writable": true
        },
        {
          "name": "tokenAccountReceiver",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "output",
          "type": {
            "defined": {
              "name": "computationOutputs"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawAmount",
      "discriminator": [
        174,
        32,
        44,
        71,
        244,
        75,
        235,
        8
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "clusterAccount",
          "writable": true
        },
        {
          "name": "poolAccount",
          "writable": true,
          "address": "DXHqHhBGNM58RLk438UiEbGe9137A7zJc6JHKN3qMZoB"
        },
        {
          "name": "clockAccount",
          "address": "FHriyvoZotYiFnbUzKFjzRSb2NiaC8RPWY7jtKuKhg65"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "relayer"
        },
        {
          "name": "withdrawerUserAccount",
          "writable": true
        },
        {
          "name": "withdrawerTokenAccount"
        }
      ],
      "args": [
        {
          "name": "withdrawalAmount",
          "type": {
            "defined": {
              "name": "rescueCiphertext"
            }
          }
        },
        {
          "name": "nonce",
          "type": {
            "defined": {
              "name": "x25519Nonce"
            }
          }
        },
        {
          "name": "computationOffset",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawAmountCallback",
      "discriminator": [
        114,
        121,
        141,
        69,
        95,
        160,
        112,
        198
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "arciumProgram",
          "address": "BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6"
        },
        {
          "name": "compDefAccount"
        },
        {
          "name": "instructionsSysvar",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "withdrawerTokenAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "output",
          "type": {
            "defined": {
              "name": "computationOutputs"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "clockAccount",
      "discriminator": [
        152,
        171,
        158,
        195,
        75,
        61,
        51,
        8
      ]
    },
    {
      "name": "cluster",
      "discriminator": [
        236,
        225,
        118,
        228,
        173,
        106,
        18,
        60
      ]
    },
    {
      "name": "computationDefinitionAccount",
      "discriminator": [
        245,
        176,
        217,
        221,
        253,
        104,
        172,
        200
      ]
    },
    {
      "name": "persistentMxeAccount",
      "discriminator": [
        32,
        115,
        16,
        240,
        209,
        25,
        92,
        165
      ]
    },
    {
      "name": "relayerAccount",
      "discriminator": [
        94,
        235,
        98,
        227,
        126,
        208,
        77,
        139
      ]
    },
    {
      "name": "stakingPoolAccount",
      "discriminator": [
        197,
        149,
        223,
        199,
        86,
        73,
        227,
        77
      ]
    },
    {
      "name": "umbraTokenAccount",
      "discriminator": [
        131,
        122,
        246,
        55,
        83,
        8,
        249,
        143
      ]
    },
    {
      "name": "umbraUserAccount",
      "discriminator": [
        189,
        21,
        223,
        27,
        223,
        94,
        238,
        92
      ]
    }
  ],
  "events": [
    {
      "name": "depositEvent",
      "discriminator": [
        120,
        248,
        61,
        83,
        31,
        142,
        107,
        144
      ]
    },
    {
      "name": "transferAmountEvent",
      "discriminator": [
        118,
        189,
        26,
        21,
        55,
        195,
        233,
        235
      ]
    },
    {
      "name": "withdrawAmountEvent",
      "discriminator": [
        61,
        151,
        52,
        195,
        30,
        183,
        113,
        8
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidRelayer",
      "msg": "Invalid relayer"
    },
    {
      "code": 6001,
      "name": "invalidOwner",
      "msg": "Invalid owner"
    },
    {
      "code": 6002,
      "name": "invalidRelayerAddress",
      "msg": "Invalid Relayer Address for Corresponding Public Key"
    },
    {
      "code": 6003,
      "name": "invalidSignerPermissions",
      "msg": "Pubkey does not have permissions to update relayer!"
    },
    {
      "code": 6004,
      "name": "invalidDepositAmount",
      "msg": "Invalid Deposit Amount!"
    },
    {
      "code": 6005,
      "name": "invalidTransferAmount",
      "msg": "Invalid Transfer Amount!"
    },
    {
      "code": 6006,
      "name": "invalidTokenTransfer",
      "msg": "Invalid Token Transfer Type"
    },
    {
      "code": 6007,
      "name": "invalidWithdrawalAmount",
      "msg": "Invalid Withdrawal Amount"
    }
  ],
  "types": [
    {
      "name": "activation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "activationEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "deactivationEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          }
        ]
      }
    },
    {
      "name": "circuitSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "onChain",
            "fields": [
              {
                "defined": {
                  "name": "onChainCircuitSource"
                }
              }
            ]
          },
          {
            "name": "offChain",
            "fields": [
              {
                "defined": {
                  "name": "offChainCircuitSource"
                }
              }
            ]
          }
        ]
      }
    },
    {
      "name": "clockAccount",
      "docs": [
        "An account storing the current network epoch"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "currentEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "startEpochTimestamp",
            "type": {
              "defined": {
                "name": "timestamp"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "cluster",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "maxSize",
            "type": "u32"
          },
          {
            "name": "activation",
            "type": {
              "defined": {
                "name": "activation"
              }
            }
          },
          {
            "name": "maxCapacity",
            "type": "u64"
          },
          {
            "name": "cuPrice",
            "type": "u64"
          },
          {
            "name": "cuPriceProposals",
            "type": {
              "array": [
                "u64",
                32
              ]
            }
          },
          {
            "name": "lastUpdatedEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "encryptionKey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "compositionRules",
            "type": {
              "option": {
                "defined": {
                  "name": "clusterCompositionRules"
                }
              }
            }
          },
          {
            "name": "mxes",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "nodes",
            "type": {
              "vec": {
                "defined": {
                  "name": "nodeRef"
                }
              }
            }
          },
          {
            "name": "pendingNodes",
            "type": {
              "vec": {
                "defined": {
                  "name": "nodeRef"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "clusterCompositionRules",
      "docs": [
        "migration_jurisdiction_filter is the locations as",
        "[ISO 3166-1 alpha-2](https://www.iso.org/iso-3166-country-codes.html) country code"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "migrationJurisdictionFilter",
            "type": "bytes"
          },
          {
            "name": "filterPositive",
            "type": "bool"
          },
          {
            "name": "nodeBlacklist",
            "type": {
              "vec": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "clusterReference",
      "docs": [
        "A reference to a [ClusterAccount]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offset",
            "type": "u32"
          },
          {
            "name": "encryptionScheme",
            "type": {
              "defined": {
                "name": "encryptionScheme"
              }
            }
          }
        ]
      }
    },
    {
      "name": "computationDefinitionAccount",
      "docs": [
        "An account representing a [ComputationDefinition] in a MXE."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "finalizationAuthority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "finalizeDuringCallback",
            "type": "bool"
          },
          {
            "name": "cuAmount",
            "type": "u64"
          },
          {
            "name": "definition",
            "type": {
              "defined": {
                "name": "computationDefinitionMeta"
              }
            }
          },
          {
            "name": "circuitSource",
            "type": {
              "defined": {
                "name": "circuitSource"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "computationDefinitionMeta",
      "docs": [
        "A computation definition for execution in a MXE."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "circuitLen",
            "type": "u32"
          },
          {
            "name": "signature",
            "type": {
              "defined": {
                "name": "computationSignature"
              }
            }
          },
          {
            "name": "callbackDiscriminator",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "computationOutputs",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "bytes",
            "fields": [
              "bytes"
            ]
          },
          {
            "name": "abort"
          }
        ]
      }
    },
    {
      "name": "computationSignature",
      "docs": [
        "The signature of a computation defined in a [ComputationDefinition]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "parameters",
            "type": {
              "vec": {
                "defined": {
                  "name": "parameter"
                }
              }
            }
          },
          {
            "name": "outputs",
            "type": {
              "vec": {
                "defined": {
                  "name": "output"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "depositEvent",
      "type": {
        "kind": "struct"
      }
    },
    {
      "name": "encryptionScheme",
      "docs": [
        "The encryption scheme used to encrypt the data in the Cluster"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "clusterEncryption"
          },
          {
            "name": "mxeEncryption",
            "fields": [
              {
                "option": {
                  "array": [
                    "u8",
                    32
                  ]
                }
              }
            ]
          }
        ]
      }
    },
    {
      "name": "epoch",
      "docs": [
        "The network epoch"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "mintAddress",
      "type": {
        "kind": "struct",
        "fields": [
          "pubkey"
        ]
      }
    },
    {
      "name": "nodeRef",
      "docs": [
        "A reference to a node in the cluster.",
        "The offset is to derive the Node Account.",
        "The current_total_rewards is the total rewards the node has received so far in the current",
        "epoch."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offset",
            "type": "u32"
          },
          {
            "name": "currentTotalRewards",
            "type": "u64"
          },
          {
            "name": "vote",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "offChainCircuitSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "source",
            "type": "string"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "onChainCircuitSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isCompleted",
            "type": "bool"
          },
          {
            "name": "uploadAuth",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "output",
      "docs": [
        "An output of a computation.",
        "We currently don't support encrypted outputs yet since encrypted values are passed via",
        "data objects."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "plaintextBool"
          },
          {
            "name": "plaintextU8"
          },
          {
            "name": "plaintextU16"
          },
          {
            "name": "plaintextU32"
          },
          {
            "name": "plaintextU64"
          },
          {
            "name": "plaintextU128"
          },
          {
            "name": "ciphertext"
          },
          {
            "name": "arcisPubkey"
          },
          {
            "name": "plaintextFloat"
          }
        ]
      }
    },
    {
      "name": "parameter",
      "docs": [
        "A parameter of a computation.",
        "We differentiate between plaintext and encrypted parameters and data objects.",
        "Plaintext parameters are directly provided as their value.",
        "Encrypted parameters are provided as an offchain reference to the data.",
        "Data objects are provided as a reference to the data object account."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "plaintextBool"
          },
          {
            "name": "plaintextU8"
          },
          {
            "name": "plaintextU16"
          },
          {
            "name": "plaintextU32"
          },
          {
            "name": "plaintextU64"
          },
          {
            "name": "plaintextU128"
          },
          {
            "name": "ciphertext"
          },
          {
            "name": "arcisPubkey"
          },
          {
            "name": "arcisSignature"
          },
          {
            "name": "plaintextFloat"
          },
          {
            "name": "manticoreAlgo"
          },
          {
            "name": "inputDataset"
          }
        ]
      }
    },
    {
      "name": "persistentMxeAccount",
      "docs": [
        "A persistent MPC Execution Environment."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "cluster",
            "type": {
              "defined": {
                "name": "clusterReference"
              }
            }
          },
          {
            "name": "fallbackClusters",
            "type": {
              "vec": {
                "defined": {
                  "name": "clusterReference"
                }
              }
            }
          },
          {
            "name": "computationDefinitions",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "relayerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "relayerPubkey",
            "type": {
              "defined": {
                "name": "walletPublicKey"
              }
            }
          },
          {
            "name": "relayerFee",
            "type": {
              "defined": {
                "name": "relayerFee"
              }
            }
          },
          {
            "name": "relayerLastUpdateTime",
            "type": {
              "defined": {
                "name": "time"
              }
            }
          },
          {
            "name": "relayerIsActive",
            "type": "bool"
          },
          {
            "name": "associatedToken",
            "type": {
              "defined": {
                "name": "mintAddress"
              }
            }
          }
        ]
      }
    },
    {
      "name": "relayerFee",
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "rescueCiphertext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "stakingPoolAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "time",
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "timestamp",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "transferAmountEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "transferAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "umbraAddress",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "umbraTokenAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mintAddress",
            "type": {
              "defined": {
                "name": "mintAddress"
              }
            }
          },
          {
            "name": "balance",
            "type": {
              "defined": {
                "name": "rescueCiphertext"
              }
            }
          },
          {
            "name": "nonce",
            "type": {
              "defined": {
                "name": "x25519Nonce"
              }
            }
          }
        ]
      }
    },
    {
      "name": "umbraUserAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "encryptionPubkey",
            "type": {
              "defined": {
                "name": "x25519PublicKey"
              }
            }
          }
        ]
      }
    },
    {
      "name": "uniqueIdentifier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    },
    {
      "name": "walletPublicKey",
      "type": {
        "kind": "struct",
        "fields": [
          "pubkey"
        ]
      }
    },
    {
      "name": "withdrawAmountEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newBalance",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "x25519Nonce",
      "type": {
        "kind": "struct",
        "fields": [
          "u128"
        ]
      }
    },
    {
      "name": "x25519PublicKey",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              32
            ]
          }
        ]
      }
    }
  ]
};
