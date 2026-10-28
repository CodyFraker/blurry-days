import { NextResponse } from 'next/server';

type WindowEntry = {
	count: number;
	windowStartMs: number;
};

const store = new Map<string, WindowEntry>();

export function getClientIp(request: Request): string {
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		const first = forwarded.split(',')[0]?.trim();
		if (first) {
			return first;
		}
	}
	const realIp = request.headers.get('x-real-ip')?.trim();
	if (realIp) {
		return realIp;
	}
	return 'unknown';
}

export function checkRateLimit(options: {
	key: string;
	limit: number;
	windowMs: number;
	nowMs?: number;
}): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
	const nowMs = options.nowMs ?? Date.now();
	const existing = store.get(options.key);

	if (!existing || nowMs - existing.windowStartMs >= options.windowMs) {
		store.set(options.key, { count: 1, windowStartMs: nowMs });
		return { allowed: true };
	}

	if (existing.count >= options.limit) {
		const retryAfterMs = options.windowMs - (nowMs - existing.windowStartMs);
		return {
			allowed: false,
			retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000))
		};
	}

	existing.count += 1;
	store.set(options.key, existing);
	return { allowed: true };
}

export function rateLimitOrResponse(
	request: Request,
	options: { key: string; limit: number; windowMs: number }
): NextResponse | null {
	const result = checkRateLimit(options);
	if (result.allowed) {
		return null;
	}
	return NextResponse.json(
		{ error: 'Too many requests' },
		{
			status: 429,
			headers: { 'Retry-After': String(result.retryAfterSeconds) }
		}
	);
}

export function resetRateLimitStoreForTests(): void {
	store.clear();
}
