export type Mate = {
  "version": "0.1.0",
  "name": "mate",
  "instructions": [
    {
      "name": "createGroup",
      "accounts": [
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "ratio",
          "type": "u16"
        },
        {
          "name": "members",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    },
    {
      "name": "createProject",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "group",
          "type": "string"
        },
        {
          "name": "projectType",
          "type": "string"
        },
        {
          "name": "ratio",
          "type": "u16"
        },
        {
          "name": "payments",
          "type": {
            "vec": {
              "defined": "Payment"
            }
          }
        },
        {
          "name": "currency",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "startDate",
          "type": "u64"
        },
        {
          "name": "endDate",
          "type": "u64"
        },
        {
          "name": "client",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "useProjectTreasury",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
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
      "name": "payProject",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "member0",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member1",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member2",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member4",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member5",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member6",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member7",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member8",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member9",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "group",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "ratio",
            "type": "u16"
          },
          {
            "name": "members",
            "type": {
              "vec": "publicKey"
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
      "name": "project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "group",
            "type": "string"
          },
          {
            "name": "projectType",
            "type": "string"
          },
          {
            "name": "ratio",
            "type": "u16"
          },
          {
            "name": "payments",
            "type": {
              "vec": {
                "defined": "Payment"
              }
            }
          },
          {
            "name": "currency",
            "type": "string"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "commonExpenses",
            "type": "u64"
          },
          {
            "name": "startDate",
            "type": "u64"
          },
          {
            "name": "endDate",
            "type": "u64"
          },
          {
            "name": "client",
            "type": "publicKey"
          },
          {
            "name": "milestones",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Payment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "member",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "GroupChanged",
      "fields": [
        {
          "name": "name",
          "type": "string",
          "index": false
        }
      ]
    }
  ]
};

export const IDL: Mate = {
  "version": "0.1.0",
  "name": "mate",
  "instructions": [
    {
      "name": "createGroup",
      "accounts": [
        {
          "name": "group",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "ratio",
          "type": "u16"
        },
        {
          "name": "members",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    },
    {
      "name": "createProject",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "group",
          "type": "string"
        },
        {
          "name": "projectType",
          "type": "string"
        },
        {
          "name": "ratio",
          "type": "u16"
        },
        {
          "name": "payments",
          "type": {
            "vec": {
              "defined": "Payment"
            }
          }
        },
        {
          "name": "currency",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "startDate",
          "type": "u64"
        },
        {
          "name": "endDate",
          "type": "u64"
        },
        {
          "name": "client",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "useProjectTreasury",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
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
      "name": "payProject",
      "accounts": [
        {
          "name": "project",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "member0",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member1",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member2",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member3",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member4",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member5",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member6",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member7",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member8",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member9",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "group",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "ratio",
            "type": "u16"
          },
          {
            "name": "members",
            "type": {
              "vec": "publicKey"
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
      "name": "project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "group",
            "type": "string"
          },
          {
            "name": "projectType",
            "type": "string"
          },
          {
            "name": "ratio",
            "type": "u16"
          },
          {
            "name": "payments",
            "type": {
              "vec": {
                "defined": "Payment"
              }
            }
          },
          {
            "name": "currency",
            "type": "string"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "commonExpenses",
            "type": "u64"
          },
          {
            "name": "startDate",
            "type": "u64"
          },
          {
            "name": "endDate",
            "type": "u64"
          },
          {
            "name": "client",
            "type": "publicKey"
          },
          {
            "name": "milestones",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Payment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "member",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "GroupChanged",
      "fields": [
        {
          "name": "name",
          "type": "string",
          "index": false
        }
      ]
    }
  ]
};