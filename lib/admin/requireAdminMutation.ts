import { requireAdmin } from '@/lib/auth/requireAdmin';
import {
	ADMIN_MUTATION_HEADER,
	ADMIN_MUTATION_HEADER_VALUE
} from '@/lib/admin/adminMutationHeaders';
import { NextResponse } from 'next/server';

export { ADMIN_MUTATION_HEADER, ADMIN_MUTATION_HEADER_VALUE } from '@/lib/admin/adminMutationHeaders';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'DELETE', 'PUT']);

export async function requireAdminMutation(request: Request) {
	const adminResult = await requireAdmin();
	if ('response' in adminResult) {
		return adminResult;
	}

	if (MUTATING_METHODS.has(request.method.toUpperCase())) {
		if (request.headers.get(ADMIN_MUTATION_HEADER) !== ADMIN_MUTATION_HEADER_VALUE) {
			return {
				response: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
			};
		}
	}

	return adminResult;
}
