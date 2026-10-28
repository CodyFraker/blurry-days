import { ADMIN_MUTATION_HEADER, ADMIN_MUTATION_HEADER_VALUE } from '@/lib/admin/adminMutationHeaders';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'DELETE', 'PUT']);

export function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
	const method = (init?.method ?? 'GET').toUpperCase();
	const headers = new Headers(init?.headers);

	if (MUTATING_METHODS.has(method)) {
		headers.set(ADMIN_MUTATION_HEADER, ADMIN_MUTATION_HEADER_VALUE);
	}

	return fetch(input, { ...init, headers });
}
