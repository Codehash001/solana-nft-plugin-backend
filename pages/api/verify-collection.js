import { PublicKey } from '@solana/web3.js';
import { applyCors, handlePreflight } from '../../lib/cors';
import { getSolana } from '../../lib/solana';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  applyCors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { mx } = getSolana();
    const { mint, collectionMint } = req.body || {};
    const reqId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const origin = req.headers.origin || 'unknown-origin';
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
    console.log(`[verify][${reqId}] Received request from ${origin} (ip: ${ip})`, { mint, collectionMint });

    if (!mint || !collectionMint) {
      return res.status(400).json({ ok: false, error: 'mint and collectionMint required' });
    }

    const op = mx.nfts().verifyCollection({
      mintAddress: new PublicKey(mint),
      collectionMintAddress: new PublicKey(collectionMint),
    });

    let result;
    if (op && typeof op.run === 'function') result = await op.run(); else result = await op;
    console.log(`[verify][${reqId}] Verification success`, { mint, collectionMint });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[verify] verify-collection failed', e);
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}
