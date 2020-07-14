module.exports = {
  title: "Crypto.com Chain",
  description: "Welcome to Crypto.com Chain's documentation!",
  themeConfig: {
    navbar: true,
    nav: [{
        text: "Home",
        link: "/"
      },
      {
        text: "Getting Started",
        link: "/getting-started/"
      },
      {
        text: "Thaler Testnet",
        items: [{
            text: "Setup Tutorial",
            link: "/getting-started/thaler-testnet"
          },
          {
            text: "Testnet Explorer",
            link: "https://chain.crypto.com/explorer"
          },
          {
            text: "Testnet Faucet",
            link: "https://chain.crypto.com/faucet"
          }
        ]
      },
      {
        text: "Wallet Management",
        items: [{
            text: "Overview",
            link: "/wallets/#client-cli"
          },
          {
            text: "Client CLI",
            link: "/wallets/client-cli.html#client-cli"
          },
          {
            text: "Sample Chain Wallet",
            link: "/wallets/sample-chain-wallet.html#sample-chain-wallet"
          },
          {
            text: "Client RPC",
            link: "/wallets/client-rpc.html#client-rpc"
          }
        ]
      },
      {
        text: "Download",
        link: "https://crypto-com.github.io/Crypto.com_Chain.pdf"
      }
    ],
    sidebar: {
      "/getting-started/": [
        "",
        "local-devnet",
        "send_your_first_transaction",
        "thaler-testnet",
        "local_full_node_development",
        "consensus",
        "genesis",
        "chain-id-and-network-id",
        "transaction-accounting-model",
        "transaction",
        "serialization",
        "signature-schemes",
        "client-flow",
        "enclave-architecture",
        "transaction-privacy",
        "staking",
        "reward-and-punishments",
        "node-joining",
        "network-parameters",
        "notes-on-production-deployment",
        "notes-on-performance",
        "threat-model",
        "technical_glossary"
      ],
      "/wallets/": ["", "client-cli", "sample-chain-wallet", "client-rpc"]
    },
    displayAllHeaders: true
  },
  base: "/docs/",
  plugins: [
    [
      "vuepress-plugin-export",
      {
        page: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: 60,
            left: 20,
            right: 20,
            bottom: 60
          }
        },
        sorter: function (a, b) {
          var ordering = {
            Home: 0,
            "Getting Started": 1,
            "Devnet": 2,
            "Thaler Testnet": 3,
            "Local Full Node Development": 4,
            "Send Your First Transaction": 5,
            Consensus: 6,
            Genesis: 7,
            "Transaction Accounting Model": 8,
            Transaction: 9,
            Serialization: 10,
            "Signature Schemes": 11,
            "Transaction Flow": 12,
            "Enclave Architecture": 13,
            "Transaction Privacy": 14,
            "node-joining": 15,
            Staking: 16,
            "reward-and-punishments":17,
            "network-parameters": 18,
            "Notes on Performance": 19,
            "Notes on Production Deployment": 20,
            "Threat Model": 21,
            "technical_glossary": 22
          };
          return ordering[a["title"]] - ordering[b["title"]];
        }
      }
    ]
  ]
};
