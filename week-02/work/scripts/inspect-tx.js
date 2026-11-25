// Inspect a transaction over JSON-RPC: inputs (with the Cells they spend), outputs, and outputs_data.
// Usage: node inspect-tx.js <tx_hash>
import { ccc } from '@ckb-ccc/core';
import { ckb, rpc, run } from './lib.js';

const short = (h) => (h.length > 22 ? h.slice(0, 12) + '…' + h.slice(-8) : h);
const lockDesc = (s) => `lock{code_hash ${short(s.code_hash)}, hash_type ${s.hash_type}, args ${s.args}}`;
const utf8 = (hex) => {
  if (hex === '0x') return '(empty)';
  const text = ccc.bytesTo(hex, 'utf8');
  return /^[\x20-\x7e]*$/.test(text) ? JSON.stringify(text) : '(binary)';
};

run(async () => {
  const hash = process.argv[2];
  if (!/^0x[0-9a-f]{64}$/i.test(hash ?? '')) throw new Error('Usage: node inspect-tx.js <tx_hash>');

  const { transaction: tx, tx_status: status } = await rpc('get_transaction', [hash]);
  console.log('get_transaction', hash);
  console.log(`tx_status: ${status.status}, block_hash: ${status.block_hash}`);
  console.log(`version: ${tx.version}, cell_deps: ${tx.cell_deps.length}, header_deps: ${tx.header_deps.length}, witnesses: ${tx.witnesses.length}`);
  tx.cell_deps.forEach((d, i) => console.log(`  cell_dep ${i}: ${short(d.out_point.tx_hash)}#${parseInt(d.out_point.index)} (${d.dep_type})`));

  let inTotal = 0n;
  console.log(`\ninputs (${tx.inputs.length}):`);
  for (const [i, input] of tx.inputs.entries()) {
    const { tx_hash, index } = input.previous_output;
    const prev = (await rpc('get_transaction', [tx_hash])).transaction;
    const cell = prev.outputs[parseInt(index)];
    inTotal += BigInt(cell.capacity);
    console.log(`  ${i}: previous_output ${short(tx_hash)}#${parseInt(index)}, since ${input.since}`);
    console.log(`     spends ${ckb(cell.capacity)}, ${lockDesc(cell.lock)}`);
  }

  let outTotal = 0n;
  console.log(`\noutputs (${tx.outputs.length}):`);
  tx.outputs.forEach((o, i) => {
    outTotal += BigInt(o.capacity);
    const data = tx.outputs_data[i];
    console.log(`  ${i}: ${ckb(o.capacity)}, ${lockDesc(o.lock)}, type ${o.type ? short(o.type.code_hash) : 'null'}`);
    console.log(`     outputs_data[${i}]: ${data} ${utf8(data)} — ${(data.length - 2) / 2} bytes`);
  });

  console.log(`\nfee = inputs ${ckb(inTotal)} - outputs ${ckb(outTotal)} = ${ckb(inTotal - outTotal)}`);
});
