# Update Tendermint Genesis Configuration

Copy the generated genesis configuration prepared previously and append it to `~/.tendermint/config/genesis.json` such that the file looks similar to this:
```diff
{
  "genesis_time": "2019-05-21T09:47:56.206264Z",
  "chain_id": "test-chain-y3m1e6-AB",
  "consensus_params": {
    "block": {
      "max_bytes": "22020096",
      "max_gas": "-1",
      "time_iota_ms": "1000"
    },
    "evidence": { "max_age": "100000" },
    "validator": { "pub_key_types": ["ed25519"] }
  },
  "validators": [
    {
      "address": "91A26F2D061827567FE1E2ADC1C22206D4AD0FEF",
      "pub_key": {
        "type": "tendermint/PubKeyEd25519",
        "value": "MFgW9OkoKufCrdAjk7Zx0LMWKA/0ixkmuBpO0flyRtU="
      },
      "power": "10",
      "name": ""
    }
  ],
+ "app_hash": "B3B873229A5FD2921801E592F3122B61C3CAE0C55FE0346369059F6643C751CC",
+  "app_state": {
+    "distribution": {
+      "0x20a0bee429d6907e556205ef9d48ab6fe6a55531": [
+        "2500000000000000000",
+        "ExternallyOwnedAccount"
+      ],
+      "0x35f517cab9a37bc31091c2f155d965af84e0bc85": [
+        "2500000000000000000",
+       "ExternallyOwnedAccount"
+      ],
+      "0x3a102b53a12334e984ef51fda0baab1768116363": [
+        "2500000000000000000",
+        "ExternallyOwnedAccount"
+      ],
+      "0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de": [
+        "1250000000000000000",
+        "ExternallyOwnedAccount"
+      ],
+      "0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07": [
+        "1250000000000000000",
+        "ExternallyOwnedAccount"
+      ]
+    },
+    "launch_incentive_from": "0x35f517cab9a37bc31091c2f155d965af84e0bc85",
+    "launch_incentive_to": "0x20a0bee429d6907e556205ef9d48ab6fe6a55531",
+    "long_term_incentive": "0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07",
+    "network_params": {
+      "initial_fee_policy": {
+        "constant": 1001,
+        "coefficient": 1025
+      },
+      "required_council_node_stake": "1250000000000000000",
+      "unbonding_period": 60
+    },
+    "council_nodes": [
+      {
+        "staking_account_address": "0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de",
+        "consensus_pubkey_type": "Ed25519",
+        "consensus_pubkey_b64": "EIosObgfONUsnWCBGRpFlRFq5lSxjGIChRlVrVWVkcE="
+      }
+    ]
+  }
}
```
