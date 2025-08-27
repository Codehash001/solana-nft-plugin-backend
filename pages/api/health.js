import { applyCors, handlePreflight } from '../../lib/cors';
import { getSolana } from '../../lib/solana';

export default async function handler(req, res) {
  if (handlePreflight(req, res)) return;
  applyCors(req, res);

  try {
    const { authorityPubkey } = getSolana();
    res.status(200).json({ ok: true, network: 'testnet', authority: authorityPubkey, time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}
