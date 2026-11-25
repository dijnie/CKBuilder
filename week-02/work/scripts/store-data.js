// Store Data on Cell: create a Cell whose data field holds a UTF-8 message, then read it back.
// Usage: node store-data.js [message] [--dry-run]
import { ccc } from '@ckb-ccc/core';
import { ckb, rpc, run, sendAndWait, sender } from './lib.js';

run(async () => {
  const message = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'Hello CKB from CKBuilder Week 2!';
  const signer = sender();
  const { script: lock } = await signer.getRecommendedAddressObj();
  const data = ccc.hexFrom(ccc.bytesFrom(message, 'utf8'));

  // No capacity given: CCC sets the minimum (8 capacity + 53 lock + data bytes) automatically.
  const tx = ccc.Transaction.from({ outputs: [{ lock }], outputsData: [data] });
  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000);
  const signed = await signer.signTransaction(tx);

  console.log('Message:', JSON.stringify(message), `(${ccc.bytesFrom(data).length} bytes)`);
  console.log('Data cell capacity:', ckb(signed.outputs[0].capacity));

  const txHash = await sendAndWait(signed, 'Store-data transaction');
  if (!txHash) return;

  const live = await rpc('get_live_cell', [{ tx_hash: txHash, index: '0x0' }, true]);
  console.log('get_live_cell status:', live.status);
  console.log('Cell data (hex):', live.cell.data.content);
  console.log('Cell data (utf8):', ccc.bytesTo(live.cell.data.content, 'utf8'));
  console.log('Inspect with: npm run week2:inspect --', txHash);
});
