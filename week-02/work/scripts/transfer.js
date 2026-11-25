// Transfer CKB: move capacity from the shared Pudge wallet to a second address.
// Usage: node transfer.js [--to <ckt1... address>] [--amount <CKB>] [--dry-run]
import { ccc } from '@ckb-ccc/core';
import { ckb, receiver, run, sendAndWait, sender } from './lib.js';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};

run(async () => {
  const from = sender();
  const to = arg('--to') ?? (await receiver().getRecommendedAddress());
  const amount = arg('--amount', '100');
  const { script: toLock } = await ccc.Address.fromString(to, from.client);

  console.log('From:', await from.getRecommendedAddress());
  console.log('To:  ', to);
  console.log('Sender balance before:', ckb(await from.getBalance()));

  const tx = ccc.Transaction.from({
    outputs: [{ lock: toLock, capacity: ccc.fixedPointFrom(amount) }],
  });
  await tx.completeInputsByCapacity(from);
  await tx.completeFeeBy(from, 1000); // adds a change output back to the sender
  const signed = await from.signTransaction(tx);

  console.log(`Inputs: ${signed.inputs.length}, outputs: ${signed.outputs.length}`);
  signed.outputs.forEach((o, i) => console.log(`  output ${i}: ${ckb(o.capacity)}`));

  const txHash = await sendAndWait(signed, 'Transfer');
  if (txHash) console.log('Inspect with: npm run week2:inspect --', txHash);
});
