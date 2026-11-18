import { randomBytes } from 'node:crypto';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { ccc } from '@ckb-ccc/core';

async function main() {
  const walletDir = import.meta.dirname;
  const keyPath = path.join(walletDir, 'pudge.key');

  await fs.mkdir(walletDir, { recursive: true, mode: 0o700 });
  try {
    await fs.writeFile(keyPath, randomBytes(32).toString('hex') + '\n', {
      flag: 'wx',
      mode: 0o600,
    });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }

  const key = (await fs.readFile(keyPath, 'utf8')).trim().replace(/^0x/i, '');
  if (!/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error('pudge.key must contain a 32-byte hex private key.');
  }

  const signer = new ccc.SignerCkbPrivateKey(new ccc.ClientPublicTestnet(), '0x' + key);
  const address = await signer.getRecommendedAddress();
  await fs.writeFile(path.join(walletDir, 'address.txt'), address + '\n');
  console.log(address);
  console.log("Faucet: https://faucet.nervos.org/");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
