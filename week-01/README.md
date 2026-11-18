# CKBuilder Weekly Report — Week 1

**Practice date:** November 18, 2026  
**Focus:** Building, deploying, and testing the TypeScript `hello-world` script

**Onboarding:** Local OffCKB setup and deployment were completed before submission. [Devnet startup screenshot](screenshot/offckb-devnet-running.png).

## Learning resources

- [How CKB Works](https://docs.nervos.org/docs/getting-started/how-ckb-works)
- [CKB Academy Lessons 1 and 2](https://academy.ckb.dev/courses)
- [Introduction to Script](https://docs.nervos.org/docs/script/intro-to-script)

CKB transactions consume live input Cells and create new output Cells. A Lock Script controls whether an input may be spent. A Type Script can enforce rules on inputs and outputs. A deployment stores code in a Cell for later transactions to reference and execute.

## Practical progress

| Exercise | Result | Evidence |
| --- | --- | --- |
| Build and deploy the TypeScript `hello-world` template | OffCKB compiled `hello-world.bc` and confirmed the deployment on Pudge Testnet. The code Cell is output `0`. | [Deployment screenshot](screenshot/hello-world-testnet-deployment.png), [Testnet Explorer](https://testnet.explorer.nervos.org/transaction/0x897b1344d9c075eaa50432013ca38ce9c3602fa1d534262afec27c5a61bed51f), [deployment metadata](work/deployment/scripts.json) |
| Run the mock test | One test passed. The `hello-world` Type Script returned `0` and used 3,957,269 cycles in the mock run. | [Passing mock test](screenshot/hello-world-mock-test-pass.png) |
| Use the deployed contract on Pudge | A separate transaction created output `0` with `hello-world` as its Type Script and was confirmed in block 23,099,987. The preflight estimate was 5,601,907 cycles for the transaction. | [Execution screenshot](screenshot/hello-world-testnet-execution.png), [Testnet Explorer](https://testnet.explorer.nervos.org/transaction/0x1aa3a43b00f9e3f03c1154ea4e1c2f6c4f72e36747724eed617b41d0b1e9aeb8) |

[Full terminal log](evidence/testnet-terminal-log.txt) for the deployment, mock test, and transaction that used the deployed script.

## Reproduce the exercises

To build and run the mock test, use the following commands from the repository root:

```bash
cd week-01/work
npm ci
npm run build
npm run test:only -- --runInBand tests/hello-world.mock.test.ts
```

To repeat the Testnet deployment, create or sync the shared wallet from the repository root and fund it through the faucet. Copy `week-01/work/.env.example` to `week-01/work/.env` if needed. Then run `npm run deploy:testnet` from `week-01/work`.

### Use the deployed script on Pudge

From `week-01/work`, run the first command to estimate execution cycles. Run the second when ready to broadcast a transaction that creates an output using the deployed `hello-world` contract as its Type Script.

```bash
npm run use:testnet -- --dry-run
npm run use:testnet
```

The command uses the shared Pudge wallet and the contract already recorded in `deployment/scripts.json`. It prints the new transaction's Explorer link and waits for confirmation.

## Personal reflection

I waited for OffCKB to report `tx committed.` and used the deployment metadata to identify the code Cell at output index `0`. Then I ran the mock test and checked the Type Script's return code and Jest's result to see how the script executed.

The mock run printed a WASI experimental warning. I checked the test summary and the script output to interpret the run. Jest reported one passing test, and the Type Script returned `0`. I also sent a separate Pudge transaction that referenced the code Cell and used `hello-world` as an output Type Script.

## Next week

Complete **Transfer CKB** and **Store Data on Cell**, then use RPC to identify the inputs, outputs, and data in a practice transaction.
