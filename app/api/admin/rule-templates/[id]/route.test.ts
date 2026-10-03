import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET } from './route';

const requireAdmin = vi.fn();

vi.mock('@/lib/auth/requireAdmin', () => ({
	requireAdmin: () => requireAdmin()
}));

vi.mock('@/lib/admin/ruleTemplates/ruleTemplateAdmin', () => ({
	getAdminRuleTemplateById: vi.fn()
}));

vi.mock('@/lib/admin/auditLog', () => ({
	recordAdminAction: vi.fn()
}));

vi.mock('@/lib/db', () => ({
	db: {
		delete: () => ({
			where: () => ({
				returning: () => Promise.resolve([])
			})
		})
	}
}));

describe('GET /api/admin/rule-templates/:id', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 403 when not admin', async () => {
		requireAdmin.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
		});

		const response = await GET(new Request('http://localhost'), {
			params: Promise.resolve({ id: 'x' })
		});

		expect(response.status).toBe(403);
	});
});

describe('DELETE /api/admin/rule-templates/:id', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 401 when unauthorized', async () => {
		requireAdmin.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
		});

		const response = await DELETE(new Request('http://localhost'), {
			params: Promise.resolve({ id: 'x' })
		});

		expect(response.status).toBe(401);
	});
});
