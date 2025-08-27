import bs58 from 'bs58';
import { Connection, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';

let cached;

export function getSolana() {
  if (cached) return cached;
  const secret = process.env.COLLECTION_AUTHORITY_SECRET;
  if (!secret) {
    throw new Error('Missing COLLECTION_AUTHORITY_SECRET env var (base58)');
  }
  const authority = Keypair.fromSecretKey(bs58.decode(secret));
  const RPC = process.env.SOLANA_RPC_URL || 'https://api.testnet.solana.com';
  const connection = new Connection(RPC, 'confirmed');
  const mx = Metaplex.make(connection).use(keypairIdentity(authority));
  const authorityPubkey = authority.publicKey.toBase58();
  cached = { authority, authorityPubkey, connection, mx };
  return cached;
}
