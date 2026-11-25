# Week 2 scripts

These are plain Node.js ES modules that use `@ckb-ccc/core` from the root `node_modules`. Run them from the repository root with the `npm run week2:*` scripts.

| Script | npm script | What it does |
| --- | --- | --- |
| `scripts/transfer.js` | `week2:transfer` | Sends `--amount` CKB (default 100) to `--to` (default: the receiver wallet), with a change output back to the sender. |
| `scripts/store-data.js` | `week2:store` | Creates a Cell that stores a UTF-8 message as its data, then reads it back with `get_live_cell`. |
| `scripts/inspect-tx.js` | `week2:inspect` | Prints the inputs, outputs, `outputs_data`, cell deps, and fee of a transaction, using raw JSON-RPC. |
| `scripts/lib.js` | — | Shared Pudge client, wallets, raw `rpc()` helper, and send-and-wait logic. |

`transfer` and `store` accept `--dry-run`, which builds and signs the transaction, estimates its cycles, and stops without sending it.
