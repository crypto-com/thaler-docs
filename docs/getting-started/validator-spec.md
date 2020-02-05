## Spec

Specification for validator logic, using simple relational database concepts(table/index/unique constraint) and pseudo-codes(sql+rust).

## Configs

Config items will be referenced in pseudo code directly.

- `max_validators`
- `minimal_required_staking`
- `jail_duration`
- `slash_wait_period`
- `reward_period`
- `unbonding_period`

Config constraints:

- `jail_duration >= slash_wait_period`

  To make sure unjail not happen before slash.

- `slash_wait_period >= max_evidence_age`

  To make sure all the evidences of validator are processed before slash.

- `unbonding_period >= max_evidence_age + slash_wait_period`

  To make sure unbonded coins not withdrawn before  evidences detected and slashed.

### Table schema

Table is a set of rows with auto updated primary and secondary indexes.

```sql
-- account model
create table staked_state {
  staking_address text primary key,
  bonded: int,
  unbonded: int,
  unbond_time: timestamp default=0,
  -- TODO nonce: int,
}

-- current validator state
create table validator (
  staking_address text primary key,
  bonded int indexed,
  validator_address text indexed unique,
  council_node_info json,
  inactive_time timestamp null,  -- the block time when node becomes inactive, null means active validator candidate
  voting_power int = bonded / 10000_0000,  -- computed on the fly
);

-- Currently chosen validator set and voting powers snapshoted at the end of last block
create table validator_snapshot (
  staking_address text primary key,
  voting_power int,
);

create table reward_stat (
  staking_address primary key,
  blocks int,  -- or votes
);

create table punishment (
    staking_address primary key,
    slash_rate decimal,
    jail_time timestamp (partial indexed when slash_amount is null),  -- the timestamp validator is jailed.
    slash_reason text,
    slash_amount int null,  -- amount slashed, null means slash not executed yet.
);

last_reward_distribution_time: timestamp = 0
```

### Init

```
load all tables
```

### `commit`

```sql
save all tables
```

### `end_block`

#### Set `inactive_time` for newly inactive validators

Find the newly inactive validators, mark them by settings `inactive_time`, after this, `inactive_time is null` means active validator candidate.

```sql
update validator set inactive_time=:block_time
  where inactive_time is null  -- active currently
    and ( bonded < minimal_required_staking  -- not enough bonded coins
       or exists (select 1 from punishment where staking_address=validator.staking_address)  -- or punished
        );
```

#### Generate validator updates

```sql
-- get new validators
new_validators = select validator_address, voting_power
  from validator
  order by bonded desc, staking_address
  where inactive_time is null  -- active validator candidate
  limit max_validators

-- get old validators
old_validators = select * from validator_snapshot;

replace validator_snapshot with new_validators;

validator_updates = diff_validators(
    old_validators.collect::<HashMap<_, _>>(),
    new_validators.collect::<HashMap<_, _>>()
)
```

```rust
fn diff_validators(
    old: &HashMap<ValidatorAddress, VotingPower>,
    new: &HashMap<ValidatorAddress, VotingPower>,
) -> Vec<(ValidatorAddress, VotingPower)> {
    // updates + removes
    new.iter()
        .filter_map(|(addr, power)| {
            if old.get::<str>(addr) != Some(power) {
                Some((addr.clone(), *power))
            } else {
                None
            }
        })
        .chain(old.iter().filter_map(|(addr, _)| {
            if !new.contains_key(addr) {
                Some((addr.clone(), 0))
            } else {
                None
            }
        }))
        .collect::<Vec<_>>()
}
```

#### Cleanup

```sql
delete from validator
  where inactive_time is not null  -- inactive
    and :block_time - inactive_time > max_evidence_age  -- have been inactive for `max_evidence_age`
    and not exists (select 1 from reward_stat where staking_address = validator.staking_address)  -- no reward_stat record
    and not exists (select 1 from punishment where staking_address = validator.staking_address)  -- not jailed
```

### `deliver_tx`

#### Handle `deposit` tx

- validator status will be updated at `end_block`

```sql
if not exists (select 1 from punishment where staking_address = :staking_address):
  -- not jailed
  insert into staked_state values (:staking_address, :amount, 0)
    on conflict (staking_address) do
    update set bonded = bonded + EXCLUDED.bonded
  returning bonded into value;

if value is not null:
  update validator set bonded = value where staking_address = :staking_address;
```

#### Handle `unbond` tx

- validator status will be updated at `end_block`

```sql
update staked_state
   set bonded = bonded - :amount, unbonded = unbonded + :amount, unbond_time = :block_time
 where staking_address = :staking_address
   and not exists (select 1 from punishment where staking_address = staked_state.staking_address)  -- not jailed
 returning bonded into value;

update validator set bonded = value where staking_address = :staking_address;
```

#### Handle `withdraw_all_unbonded` tx

```sql
update staked_state
   set unbonded = 0
 where staking_address = :staking_address
   and :block_time >= unbond_time + unbonding_period
```

#### Join node

- Insert into `validator` table
- Uniqueness of `validator_address` and `staking_address` are ensured by the index
- If `staking_address` exists, and conditions for active validator are met, clear `inactive_time` and update `validator_address` and `council_node_info` with new informations.

```sql
select bonded from staked_state where staking_address = :staking_address;

insert into validator values (
  :staking_address,
  (select bonded from staked_state where staking_address = :staking_address),
  :validator_address,
  :council_node_info
) on conflict (staking_address) do
  -- do re-join
  update
     set inactive_time = null,
         bonded = EXCLUDED.bonded,  -- Should be the same already.
         validator_address = EXCLUDED.validator_address
         council_node_info = EXCLUDED.council_node_info
   where EXCLUDED.bonded >= minimal_required_staking
     and not exists (select 1 from punishment where staking_address = validator.staking_address);
```

#### Unjail

- Remove punishment record if `jail_duration` has passed
- validator status will be updated at `end_block`

```sql
delete from punishment
  where staking_address = :staking_address
    and :block_time >= jail_time + jail_duration
```

### `begin_block`

#### Jail (byzantine or non-liveness)

- process detected liveness/byzantine fault
- calculate `punishments: Vec<(staking_address, slash_rate, slash_reason)>`, including new punishments and to be updated punishment

```sql
for (staking_address, slash_rate, slash_reason) in punishments.iter() {
    -- upsert, keep the severer one when update.
    insert into punishment values (
      :staking_address,
      :slash_rate,
      :block_time,
      :slash_reason
    ) on conflict(staking_address) do
        update slash_rate = EXCLUDED.slash_rate
               slash_reason = EXCLUDED.slash_reason
          where EXCLUDED.slash_rate > punishment.slash_rate
            and punishment.slash_amount is null;  -- null means not slashed yet.
}

-- clear reward_stat of punished validators
delete from reward_stat where staking_address in [punished staking addresses];
```

#### Slash

Execute the punishment after `slash_wait_period`

```sql
update punishment
   set slash_amount = execute_slash(staking_address, slash_rate)
 where :block_time >= jail_time + slash_wait_period
   and slash_amount is null  -- not executed yet

fn execute_slash(staking_address, slash_rate) {
  update staked_state
     set bonded -= bonded * slash_rate,
         unbonded -= unbonded * slash_rate
    where staking_address=:staking_address
    returning bonded_slashed, unbonded_slashed;

  return bonded_slashed + unbonded_slashed;
}
```

#### Reward distribution

```sql
-- record block proposer for each block
select staking_address into addr from validator
  where validator_address=?;

insert into reward_stat values (addr, 1)
  on conflict(staking_address) do
  update set blocks=EXCLUDED.blocks+1;
```

```sql
if :block_time - last_reward_distribution_time > reward_period:
  last_reward_distribution_time = :block_time

  -- 1. calculate reward amount

  -- 2. calculate the proportions for each validator's staking addresses
  select sum(blocks) into num_blocks from reward_stat;
  select staking_address, blocks / num_blocks as proportion from reward_stat;

  -- 3. deposit coins into staking addresses
  [Handle `deposit` tx](#handle-deposit-tx)

  -- 4. clear reward stat
  truncate table reward_stat;
```

## Rust implementation considerations

- Table is implemented with `Slab<Row>`, unique index/primary key is implemented as `BTreeMap<field, usize>` or `HashMap<field, usize>`, non-unique index is implemented as `BTreeMap<field, Vec<usize>>`, indexing structures need to be maintained manually.
- Order by composite type (`order by bonded, staking_address`) is implemented with composite index(`BTreeMap<(Coin, StakingAddress), usize>`).
- Since it takes `minimal_required_staking` coins to become a validator, so the number of validators should not be too much, so it might be ok for some operations to have `O(N)` complexity, so we can get rid of some indexing structures and keep code simpler.
- `staked_state` is stored in merkle trie, only support primary key query.
