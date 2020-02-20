# Validator Punishments

This part describes functionality that aims to dis-incentivize network-observable actions, such as faulty validations,
of participants with values at stake by penalizing/slashing and jailing them. The penalties may include losing some
amount of their stake (surrendered to the rewards pool), losing their ability to perform the network functionality for a
period of time, collect rewards etc.

## Network Parameters

Below are all the network parameters used to configure the behavior of validator punishments. Details of all these
parameters and their effect on behavior of validator punishments is discussed later in this document.

1. `UNBONDING_PERIOD`: Unbonding period will be used as jailing period (time for which an account is jailed after it
   gets punished) and also as slashing period (time to wait before slashing funds from an account). This should be
   greater than or equal to `MAX_EVIDENCE_AGE` in tendermint.
1. `BLOCK_SIGNING_WINDOW`: Number of blocks for which the moving average is calculated for uptime tracking.
1. `MISSED_BLOCK_THRESHOLD`: Maximum number of blocks with faulty/missed validations allowed for an account in last
   `BLOCK_SIGNING_WINDOW` blocks before it gets jailed.
1. `SLASH_RATE_MULTIPLIER`: Multiplier of funds (bonded + unbonded) slashed when validator makes a fault (liveness fault
   or byzantine fault).

:::tip Important:
During slashing, funds are slashed from both, bonded and unbonded, amounts.
:::

## Overview

Punishments for a validator are triggered when they either make a *byzantine fault* or become *non-live*: 

- Liveness Faults (Low availability)

    A validator is said to be **non-live** when they fail to sign at least `MISSED_BLOCK_THRESHOLD` blocks in
    last `BLOCK_SIGNING_WINDOW` blocks successfully. `BLOCK_SIGNING_WINDOW` and `MISSED_BLOCK_THRESHOLD` are network
    parameters and can be configured during genesis (currently, changing these network parameters at runtime is not
    supported). Tendermint passes signing information to ABCI application as `last_commit_info` in `BeginBlock` request.

:::tip Example:
For example, if `BLOCK_SIGNING_WINDOW` is `100` blocks and `MISSED_BLOCK_THRESHOLD` is `50` blocks, a validator will
be marked as **non-live** if they fail to successfully sign at least `50` blocks in last `100` blocks.
:::

- Byzantine Faults (Double signing)

    A validator is said to make a byzantine fault when they sign conflicting messages/blocks at the same height and
    round. Tendermint has mechanisms to publish evidence of validators that signed conflicting votes (it passes this 
    information to ABCI application in `BeginBlock` request), so they can be punished by the application.

:::tip Implementation note:
Tendermint passes `Evidence` of a byzantine validator in `BeginBlock` request. Before jailing any account because of
byzantine fault, that evidence should be verified. Also, it should be checked that evidence provided by tendermint is
not older than `MAX_EVIDENCE_AGE` in tendermint.
:::

### Jailing

A validator is jailed if any one of the following applies:

1. They are not **live**, i.e., they failed to sign `MISSED_BLOCK_THRESHOLD` blocks in last
   `BLOCK_SIGNING_WINDOW` blocks successfully. 
1. They make a byzantine fault, e.g., they sign messages at same height and round.

When a validator gets jailed, they cannot perform any operations relating to their account, for example,
`withdraw_stake`, `deposit_stake`, `unbond_stake`, etc., until they are un-jailed. Also, a validator cannot be un-jailed
before `account.jailed_until` which is set to `block_time + UNBONDING_PERIOD` while jailing. `UNBONDING_PERIOD` is a
network parameter which can be configured during genesis.

:::tip Important:
`block_time` used in calculating `account.jailed_until` should be the time of the block at which the fault is detected
(i.e., `current_block_height`).
:::

#### Un-jailing and Re-joining 

When a jailed validator wishes to resume normal operations (after `account.jailed_until` has passed and the account is
slashed), they can create `UnjailTx` which marks them as un-jailed. After successful un-jailing, validators can submit a
`NodeJoinTx`, which will add them back to validator set.

:::tip Important:
`UnjailTx` should only be valid after funds are slashed from jailed account.
:::

### Slashing

Validators are responsible for signing or proposing block at each consensus round. It is important that they maintain
excellent availability and network connectivity to perform these tasks. A penalty performed by the slashing module
should be imposed on validators' misbehavior or unavailability to reinforce this. Similar to jailing, a validator is
slashed if any one of the following applies:

1. They are not **live**, i.e., they failed to sign `MISSED_BLOCK_THRESHOLD` blocks in last `BLOCK_SIGNING_WINDOW`
   blocks successfully.
1. They make a byzantine fault, e.g., they sign messages at same height and round.

Unlike jailing, which happens immediately after punishments are triggered, slashing happens after `UNBONDING_PERIOD`.
`UNBONDING_PERIOD` is a network parameter and can be configured during genesis. Validators are not immediately slashed
because evidence for more faulty may be discovered after some time. If a validator makes multiple faults in
`UNBONDING_PERIOD`, they'll only be slashed once for the worst fault in that period.

:::tip Implementation note:
It should be enforced in implementation that un-jailing can only be done after an account is slashed. So, even if an
account can be un-jailed after `UNBONDING_PERIOD`, it should not be allowed to un-jail until it has been slashed.
:::

:::tip Important:
A validator should not be slashed more than once within `UNBONDING_PERIOD`. If a validator commits multiple faults
before `account.jailed_until`, it should only be slashed with the highest slash amount in that period (can be calculated
using below algorithm).
:::

#### Slashing Rate

Whenever a validator is slashed, a percentage of their `bonded` and `unbonded` amount is transferred to `rewards_pool`.
There are many factors involved in determining the slashing rate for a validator:

1. `SLASH_RATE_MULTIPLIER` is the network parameters used while calculating the slashing rate. It can be configured in
   the genesis.
1. `validator_voting_percent` is the voting percent of faulty validator in block `H` (`H` is the height of the block
   when the validator made the fault).
1. List of all the faulty validators in the block `H` and their `validator_voting_percent`s (according to above
   definition).

The algorithm for calculating `slashing_rate` when there are `n` validators who committed faults in a block:

```
slashing_rate = 
    SLASH_RATE_MULTIPLIER * 
    (
        sqrt(validator_voting_percent_1) +
        sqrt(validator_voting_percent_2) +
        .. + 
        sqrt(validator_voting_percent_n)
    )^2
```

So, if one validator of 10% voting power faults, it gets a 10% slash (assuming `SLASH_RATE_MULTIPLIER` is `1`). While,
if two validators of 5% voting power each fault together, they both get a 20% slash.

```
slashing_rate = SLASH_RATE_MULTIPLIER * (sqrt(validator_voting_percent_1) + sqrt(validator_voting_percent_2))^2
              = 1 * (sqrt(0.05) + sqrt(0.05))^2
              = 0.2
```

Finally, `slashing_amount` can be calculated by multiplying `slashing_rate` by total `bondend + unbonded` amount.

```
slash_amount_bonded = slashing_rate * bonded_amount
slash_amount_unbonded = slashing_rate * unbonded_amount
```
