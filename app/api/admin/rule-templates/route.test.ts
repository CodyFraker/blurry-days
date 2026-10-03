import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';

const requireAdmin = vi.fn();

vi.mock('@/lib/auth/requireAdmin', () => ({
	requireAdmin: () => requireAdmin()
}));

vi.mock('@/lib/admin/ruleTemplates/ruleTemplateAdmin', () => ({
	listAdminRuleTemplates: vi.fn().mockResolvedValue({
		rules: [],
		pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 }
	})
}));

vi.mock('@/lib/admin/auditLog', () => ({
	recordAdminAction: vi.fn()
}));

vi.mock('@/lib/db', () => ({
	db: {
		insert: () => ({
			values: () => ({
				returning: () =>
					Promise.resolve([
						{
							id: 'id-1',
							text: 't',
							category: 'general',
							weight: 1,
							baseDrink: 0,
							usageCount: 0,
							enabled: true,
							createdAt: new Date()
						}
					])
			})
		})
	}
}));

describe('GET /api/admin/rule-templates', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 401 when not admin session', async () => {
		requireAdmin.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
		});

		const response = await GET(new Request('http://localhost/api/admin/rule-templates'));

		expect(response.status).toBe(401);
	});

	it('returns 200 for admin', async () => {
		requireAdmin.mockResolvedValue({ user: { id: 'u1' }, discordAccountId: 'd1' });

		const response = await GET(new Request('http://localhost/api/admin/rule-templates'));

		expect(response.status).toBe(200);
	});
});

describe('POST /api/admin/rule-templates', () => {
	beforeEach(() => {
		requireAdmin.mockReset();
	});

	it('returns 403 when forbidden', async () => {
		requireAdmin.mockResolvedValue({
			response: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
		});

		const response = await POST(
			new Request('http://localhost/api/admin/rule-templates', {
				method: 'POST',
				body: JSON.stringify({})
			})
		);

		expect(response.status).toBe(403);
	});
});
