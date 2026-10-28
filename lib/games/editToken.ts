import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const GAME_EDIT_TOKEN_HEADER = 'X-Game-Edit-Token';

export function hashEditToken(token: string): string {
	return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function generateEditToken(): { token: string; hash: string } {
	const token = randomBytes(32).toString('base64url');
	return { token, hash: hashEditToken(token) };
}

export function verifyEditToken(storedHash: string | null | undefined, token: string | null): boolean {
	if (!storedHash || !token) {
		return false;
	}
	const computed = hashEditToken(token);
	if (computed.length !== storedHash.length) {
		return false;
	}
	try {
		return timingSafeEqual(Buffer.from(computed, 'utf8'), Buffer.from(storedHash, 'utf8'));
	} catch {
		return false;
	}
}
