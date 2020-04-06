# Technical glossary

[A](#a) | [B](#b) | [C](#c) | [D](#d) | E | F | G | [H](#h) | I | [J](#j) | K | [L](#l) | [M](#m) | [N](#n) | O | [P](#p) | Q | R | [S](#s) | [T](#t) | [U](#u) | [V](#v) | [W](#w) | X | Y | Z

---

#### A

**Authentication token**

The access token for wallet related commands, It can be shown by [cli-command](../wallets/client-cli.md#wallet-auth-token-show-the-authentication-token).

#### B

**Bonded (staking state)**

The non-transferable amount of token staked to the corresponding address, it can be unlocked by the `unbond` transaction.

**Byzantine Faults (Double signing)**

A validator is said to make a byzantine fault when they sign conflicting messages/blocks at the same height and round.

#### C

**Chain ID**

A unique identifier for the blockchain. Different [prefixes](./chain-id-and-network-id.md#chain-id) of the Chain ID are used to distinguish between _devnet_, _testnet_ and _mainnet_.

**Chain-abci**

The **A**pplication **B**lock**C**hain **I**nterface connects Tendermint (for consensus operations) to the actual applications.

**Client-cli**

The command line interface for the wallet client. It supports wallet management, funds transfer and basic staking operations.

**Client-rpc**

The JSONRPC interface of the wallet client. It can be used to be integrated with different services and also power the Sample Wallet. It provides nearly the same set of operations as Client-cli does.



#### D

**Deposit (Transaction type: `deposit`)**

The transaction that transfers funds from a transfer address to a staking address for staking purposes.

#### H 

**HD wallet**

The Hierarchical Deterministic wallet is a system of deriving keys from a single starting point known as mnemonic phrase, which can be easily back up and restored.

#### J

**Jailing**

A validator is jailed when they make a byzantine fault. When a validator gets jailed, they cannot perform any staking related operations relating to their account.

#### L

**Liveness Faults**

A validator is said to be non-live when they fail to sign at least `missed_block_threshold` blocks in last `block_signing_window` blocks successfully.

#### M

**Mnemonic (of a wallet)**

A human-readable 24-word mnemonic phrase of a wallet. User can restore their wallet and associated addresses with it.

#### N

**Network ID**

The last two hex characters of the Chain ID. Using our testnet Chain ID `testnet-thaler-crypto-com-chain-42` as an example, the network ID would be `42`.

**Node-join (Transaction Type: `node-join`)**

The transaction for joining the network as a validator.

**Nonce (of a staking address)**

The nonce is the number of transactions that have the witness of the staking address.

#### P

**Proposer (of a block)**

The validator who finalized the block.

#### S

**SGX**

The Intel® Software Guard Extensions (SGX) is a set of instructions that increases the security of application code and data, giving them more protection from disclosure or modification.

**Slashing**

The penalty imposed on validators' misbehaviour, which resulted in losing some amount of their staked tokens.

**Staking address**

The address for staking related operations, it follows the format of Ethereum account address.

**State (of a staking address)**

The general state of a staking address that includes _nonce_, _bounded/unbonded_ amount, and _slashing related information_ (if any).

#### T

**TDBE**

**T**ransaction **d**ata **b**ootstrapping **e**nclave responsible for fetching current UTXO set transaction data; and handling periodic key generation operations.

**Tendermint**

The underneath byzantine fault tolerant protocol for performing distributed consensus.

**tmkms**

The key management system for tendermint validators.

**TQE**

**T**ransaction **q**uery **e**nclave serves the encryption and decryption requests from wallets / clients. It allows semi-trusted client querying of sealed tx payloads.

**Transfer (Transaction type:`transfer`)**

The transaction that transfers funds between transfer addresses.

**Transfer address**

The address for payments/value transfers. Different prefixes of the transfer address are used to distinguish between devnet, testnet and mainnet.

#### U

**Unbond (Transaction type: `unbond`)**

The transaction to unbond funds in the staking address. Note that funds will only be available for withdrawal after the unbonding period has passed.

**Unbonding period**

The time duration of unbonding.

**Unjail (Transaction type: `unjail`)**

The transaction to unjail a validator.

#### V

**Validator**

The participant in the proof of stake (PoS) consensus protocol. They are responsible for transaction validation and committing new blocks in the blockchain.

**Validator keys**

The key pair for signing messages from the validator. The full key pair is located under the tendermint `priv_validator_key.json` folder.

**View key**

The key for viewing encrypted transactions.

**Voting power**

The voting power is determined by the bounded amount in validator's staking address. The probability of a validator being selected as the proposer for a round is proportional to their voting power.

#### W

**Withdraw (Transcation type :`withdraw`)**

The transaction for withdrawing funds from a staking address to a transfer address.
