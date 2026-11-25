import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { ccc } from '@ckb-ccc/core';

export const RPC_URL = 'https://testnet.ckb.dev';
export const EXPLORER = 'https://testnet.explorer.nervos.org/transaction/';
const walletDir = new URL('../../../testnet-wallet/', import.meta.url);

export const client = new ccc.ClientPublicTestnet({
  url: RPC_URL,
  fallbacks: ['https://testnet.ckbapp.dev'],
});

function readKey(name, create = false) {
  const file = new URL(name, walletDir);
  if (!existsSync(file)) {
    if (!create) throw new Error(`Missing testnet-wallet/${name}. Run npm run wallet:testnet first.`);
    writeFileSync(file, randomBytes(32).toString('hex') + '\n', { flag: 'wx', mode: 0o600 });
  }
  const key = readFileSync(file, 'utf8').trim().replace(/^0x/i, '');
  if (!/^[0-9a-f]{64}$/i.test(key)) throw new Error(`${name} must contain a 32-byte hex private key.`);
  return '0x' + key;
}

/** The funded shared Pudge wallet. */
export const sender = () => new ccc.SignerCkbPrivateKey(client, readKey('pudge.key'));

/** A second local wallet that receives the Week 2 transfer (created on first use, Git-ignored). */
export const receiver = () => new ccc.SignerCkbPrivateKey(client, readKey('receiver.key', true));

/** Raw JSON-RPC call, so we see the node's own snake_case field names. */
export async function rpc(method, params) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
  });
  const body = await res.json();
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result;
}

export async function sendAndWait(signed, label) {
  const cycles = await client.estimateCycles(signed);
  console.log('Estimated cycles:', cycles.toString());
  if (process.argv.includes('--dry-run')) {
    console.log('Dry run completed. No transaction sent.');
    return null;
  }
  const txHash = await client.sendTransaction(signed);
  console.log(`${label} sent:`, txHash);
  console.log('Testnet Explorer:', EXPLORER + txHash);
  const result = await client.waitTransaction(txHash, 0, 180000);
  if (result?.status !== 'committed') throw new Error('Transaction status: ' + (result?.status ?? 'unknown'));
  console.log('Committed in block:', result.blockNumber.toString());
  return txHash;
}

export const ckb = (shannons) => ccc.fixedPointToString(BigInt(shannons)) + ' CKB';

export function run(main) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
