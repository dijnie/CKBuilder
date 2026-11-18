import { readFileSync } from 'node:fs';
import { ccc, hashTypeToBytes, hexFrom } from '@ckb-ccc/core';
import dotenv from 'dotenv';

async function main() {
  dotenv.config({ quiet: true });
  const keyFile = process.env.TESTNET_PRIVATE_KEY_FILE;
  if (!keyFile) {
    throw new Error('Set TESTNET_PRIVATE_KEY_FILE in .env to the shared Pudge wallet key.');
  }
  const privateKey = readFileSync(keyFile, 'utf8').trim().replace(/^0x/i, '');
  const deploymentFile = new URL('../deployment/scripts.json', import.meta.url);
  const systemScriptsFile = new URL('../deployment/system-scripts.json', import.meta.url);
  const contract = JSON.parse(readFileSync(deploymentFile, 'utf8')).testnet?.['hello-world.bc'];
  const vm = JSON.parse(readFileSync(systemScriptsFile, 'utf8')).testnet?.ckb_js_vm?.script;
  if (!contract?.cellDeps?.length || !vm?.cellDeps?.length) {
    throw new Error('Missing Pudge deployment or CKB-JS-VM metadata.');
  }

  const client = new ccc.ClientPublicTestnet({
    url: 'https://testnet.ckb.dev',
    fallbacks: ['https://testnet.ckbapp.dev'],
  });
  const signer = new ccc.SignerCkbPrivateKey(client, '0x' + privateKey);
  const lock = (await signer.getRecommendedAddressObj()).script;
  const args = hexFrom(
    '0x0000' + contract.codeHash.slice(2) +
    hexFrom(hashTypeToBytes(contract.hashType)).slice(2) + '00'.repeat(32),
  );
  const contractDeps = contract.cellDeps.map(({ cellDep }) => cellDep);
  const tx = ccc.Transaction.from({
    outputs: [{ lock, type: { codeHash: vm.codeHash, hashType: vm.hashType, args } }],
    cellDeps: [...vm.cellDeps.map(({ cellDep }) => cellDep), ...contractDeps],
  });

  await tx.completeInputsByCapacity(signer);
  await tx.completeFeeBy(signer, 1000);
  const signed = await signer.signTransaction(tx);
  const cycles = await client.estimateCycles(signed);
  console.log('Contract deployment:', contractDeps[0].outPoint.txHash);
  console.log('Estimated cycles:', cycles.toString());
  if (process.argv.includes('--dry-run')) {
    console.log('Dry run completed. No transaction sent.');
    return;
  }

  const txHash = await client.sendTransaction(signed);
  console.log('Transaction sent:', txHash);
  console.log('Testnet Explorer: https://testnet.explorer.nervos.org/transaction/' + txHash);
  const result = await client.waitTransaction(txHash, 0, 180000);
  if (result?.status !== 'committed') {
    throw new Error('Transaction status: ' + (result?.status ?? 'unknown'));
  }
  console.log('Transaction committed in block:', result.blockNumber.toString());
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
