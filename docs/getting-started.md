# Getting Started
this is the beginner's tutorial to boot-strap chain

## pre-requisites
prepare ubuntu 18.0.x  
and intel cpu    
```
~/bin
```
bin folder is the main folder for binaries

## how it works
chain-tx-enclave (use intel sgx)  -> working as docker    
chain-abci     (connects to enclave)      
tendermint   (connects to chain-abci)    

## compile enclave
1. git clone chain-tx-enclave , activate docker  
```
cd ~  
git clone https://github.com/crypto-com/chain-tx-enclave.git 
cd chain-tx-enclave  
docker build -t chain-tx .   
docker run -ti --rm -p 25933:25933 -v ~/chain-tx-enclave/:/root/sgx -it chain-tx /bin/bash  
```

2. compile sgx application
you can install intel-sgx-sdk, and compile the application.
```
mkdir ~/bin
cd sgx
export SGX_MODE=SW  
export NETWORK_ID=ab  
mkdir ~/lib
make
cd ~/sgx/app  
cargo build   
```
for hw 
```
docker run -ti --device /dev/isgx -v ~/chain-tx-enclave/:/root/sgx -it chain-tx /bin/bash

root@docker:/# LD_LIBRARY_PATH=/opt/intel/libsgx-enclave-common/aesm /opt/intel/libsgx-enclave-common/aesm/aesm_service &

```
4. copy enclave lib file to the system, and cargo build
if build fails, please copy libEnclave_u.a manually.
```
cd ~/sgx
make
cd ~/sgx/app
cp libEnclave_u.a /usr/local/lib
```
5. compile the release binary and copy ~/bin
```
cargo build --release
cp ./target/release/tx-validation-app  ~/bin
cd ~/sgx
make
cp ~/sgx/bin/* ~/bin 
```

6. congratulations   
chain-tx-enclave is now ready to go

7. how to run this
```
./tx-validation-app tcp://0.0.0.0:25933  
```

## setup path
cd ~
vi .profile  
mkdir ~/bin
```
export PATH="$HOME/.cargo/bin:$PATH"
export PATH=$HOME/bin:$PATH
```

## install packages in linux
```
apt update      
apt install rsync curl git gcc unzip  libzmq3-dev  
apt install libsnappy-dev wget vim pkg-config    
```



## install rust
cd ~  
curl https://sh.rustup.rs -sSf | sh     
source $HOME/.cargo/env    
rustup default nightly-2019-05-22

## install tendermint
choose latest version of tendermint
```
https://github.com/tendermint/tendermint/releases
```
and copy to  cd ~/bin   

## get source code
git clone https://github.com/crypto-com/chain.git    
 

## compile chain-abci
vi ~/.cargo/config
```
[build]
rustflags = ["-Ctarget-feature=+aes,+ssse3"]
```
:wq  
cargo build --release   
cp ./target/release/* ~/bin


## run the program
### enclave
docker run -ti --rm  -p 25933:25933 -v ~/chain-tx-enclave:/root/sgx -it linux  /bin/bash     
export SGX_MODE=SW  
export NETWORK_ID=ab  
export RUST_LOG=info  
cd ~/sgx/bin    
cp * ~/bin  
cd ~/bin   
./tx-validation-app tcp://0.0.0.0:25933  

## how to make gensis block
1. you can create tendermint genesis.block 
cd ~/bin
vi coin.json
```
{
    "distribution":{"0x0db221c4f57d5d38b968139c06e9132aaf84e8df":"2500000000000000000",
        "0x20a0bee429d6907e556205ef9d48ab6fe6a55531":"2500000000000000000",
        "0x35f517cab9a37bc31091c2f155d965af84e0bc85":"2500000000000000000",
        "0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de":"1250000000000000000",
        "0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07":"1250000000000000000"},
    "unbonding_period": 60,
    "required_council_node_stake": "1250000000000000000",
    "initial_fee_policy": {"base_fee":"1.1","per_byte_fee":"1.25"},
    "council_nodes": [{"staking_account_address":"0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de",
        "consensus_pubkey_type":"Ed25519",
        "consensus_pubkey_b64":"EIosObgfONUsnWCBGRpFlRFq5lSxjGIChRlVrVWVkcE="}],
    "launch_incentive_from":"0x35f517cab9a37bc31091c2f155d965af84e0bc85",
    "launch_incentive_to":"0x20a0bee429d6907e556205ef9d48ab6fe6a55531",
    "long_term_incentive":"0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07",
    "genesis_time": "2019-03-21T02:26:51.366017Z"
}
```

2. run dev-utils
```
./dev-utils genesis generate   --genesis_dev_config_path ./coin.json
```

3. dev-utils result
this result will be like this
```
"app_hash": "FAF9E47D07382ADEC643BA24561F8E1C6D61FE575D184265C443B2637355CA25",
"app_state": {"distribution":{"0x0db221c4f57d5d38b968139c06e9132aaf84e8df":[2500000000000000000,"ExternallyOwnedAccount"],"0x20a0bee429d6907e556205ef9d48ab6fe6a55531":[2500000000000000000,"ExternallyOwnedAccount"],"0x35f517cab9a37bc31091c2f155d965af84e0bc85":[2500000000000000000,"ExternallyOwnedAccount"],"0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de":[1250000000000000000,"ExternallyOwnedAccount"],"0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07":[1250000000000000000,"ExternallyOwnedAccount"]},"launch_incentive_from":"0x35f517cab9a37bc31091c2f155d965af84e0bc85","launch_incentive_to":"0x20a0bee429d6907e556205ef9d48ab6fe6a55531","long_term_incentive":"0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07","network_params":{"initial_fee_policy":{"constant":1001,"coefficient":1025},"required_council_node_stake":1250000000000000000,"unbonding_period":60},"council_nodes":[{"staking_account_address":"0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de","consensus_pubkey_type":"Ed25519","consensus_pubkey_b64":"EIosObgfONUsnWCBGRpFlRFq5lSxjGIChRlVrVWVkcE="}]}
```

4. copy genesis_time,app_hash, app_state
```
 "genesis_time": "2019-03-21T02:26:51.366017Z"
 "app_hash": "FAF9E47D07382ADEC643BA24561F8E1C6D61FE575D184265C443B2637355CA25"
 "app_state": {"distribution":{"0x0db221c4f57d5d38b968139c06e9132aaf84e8df":[2500000000000000000,"ExternallyOwnedAccount"],"0x20a0bee429d6907e556205ef9d48ab6fe6a55531":[2500000000000000000,"ExternallyOwnedAccount"],"0x35f517cab9a37bc31091c2f155d965af84e0bc85":[2500000000000000000,"ExternallyOwnedAccount"],"0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de":[1250000000000000000,"ExternallyOwnedAccount"],"0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07":[1250000000000000000,"ExternallyOwnedAccount"]},"launch_incentive_from":"0x35f517cab9a37bc31091c2f155d965af84e0bc85","launch_incentive_to":"0x20a0bee429d6907e556205ef9d48ab6fe6a55531","long_term_incentive":"0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07","network_params":{"initial_fee_policy":{"constant":1001,"coefficient":1025},"required_council_node_stake":1250000000000000000,"unbonding_period":60},"council_nodes":[{"staking_account_address":"0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de","consensus_pubkey_type":"Ed25519","consensus_pubkey_b64":"EIosObgfONUsnWCBGRpFlRFq5lSxjGIChRlVrVWVkcE="}]}
```

3. initialize tendermint
```
cd ~/bin
./tendermint init
vi ~/.tendermint/config/genesis.json
copy  genesis_time, app_hash, app_state
```
and genesis.json will be like this
```

"genesis_time": "2019-03-21T02:26:51.366017Z",
"chain_id": "test-chain-y3m1e6-AB",
"consensus_params": {
"block": {
"max_bytes": "22020096",
"max_gas": "-1",
"time_iota_ms": "1000"
},
"evidence": {
"max_age": "100000"
},
"validator": {
"pub_key_types": [
"ed25519"
]
}
},
"validators": [
{
"address": "5CA148EFA895453D804819E51E3E19C4CB625971",
"pub_key": {
"type": "tendermint/PubKeyEd25519",
"value": "X1tSnpZLRorAMoT9kQ+n+M+TLWRtmkMJRMhSQ0JxMfg="
},
"power": "10",
"name": ""
}
],
"app_hash": "FAF9E47D07382ADEC643BA24561F8E1C6D61FE575D184265C443B2637355CA25",
"app_state": {"distribution":{"0x0db221c4f57d5d38b968139c06e9132aaf84e8df":["2500000000000000000","ExternallyOwnedAccount"],"0x20a0bee429d6907e556205ef9d48ab6fe6a55531":["2500000000000000000","ExternallyOwnedAccount"],"0x35f517cab9a37bc31091c2f155d965af84e0bc85":["2500000000000000000","ExternallyOwnedAccount"],"0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de":["1250000000000000000","ExternallyOwnedAccount"],"0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07":["1250000000000000000","ExternallyOwnedAccount"]},"launch_incentive_from":"0x35f517cab9a37bc31091c2f155d965af84e0bc85","launch_incentive_to":"0x20a0bee429d6907e556205ef9d48ab6fe6a55531","long_term_incentive":"0x71507ee19cbc0c87ff2b5e05d161efe2aac4ee07","network_params":{"initial_fee_policy":{"constant":1001,"coefficient":1025},"required_council_node_stake":"1250000000000000000","unbonding_period":60},"council_nodes":[{"staking_account_address":"0x3ae55c16800dc4bd0e3397a9d7806fb1f11639de","consensus_pubkey_type":"Ed25519","consensus_pubkey_b64":"EIosObgfONUsnWCBGRpFlRFq5lSxjGIChRlVrVWVkcE="}]}
```

### running abci server
abci server uses enclave.  
and tendermint connects to abci server for core.  
```
cargo run --bin chain-abci -- --host 0.0.0.0 --port 26658 --chain_id test-chain-y3m1e6-AB --genesis_app_hash FAF9E47D07382ADEC643BA24561F8E1C6D61FE575D184265C443B2637355CA25  --enclave_server tcp://127.0.0.1:25933
```

### running tenermint
tendermint will work as consensus.  
```
tendermint node
```

### client rpc
client rpc is the client for the chain.   
user interface module will connect this.  
```
cargo run --bin client-rpc -- --chain-id AB --port 3000 --storage-dir ./my --tendermint-url http://localhost:26657/
```

### check working
this is restful api for querying account.  
```
curl 'http://localhost:26657/abci_query?path=0x6163636f756e74&data=0x0db221c4f57d5d38b968139c06e9132aaf84e8df'
```



## other information  
github.com/crypto-com/chain/blob/master/README.md
