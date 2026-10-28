import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requireGameEdit } from './requireGameEdit';
import { GAME_EDIT_TOKEN_HEADER, hashEditToken } from './editToken';

const dbSelect = vi.fn();

vi.mock('@/lib/db', () => ({
	db: {
		select: () => dbSelect()
	}
}));

describe('requireGameEdit', () => {
	beforeEach(() => {
		dbSelect.mockReset();
	});

	it('returns 403 when edit token hash is missing', async () => {
		dbSelect.mockReturnValue({
			from: () => ({
				where: () => ({
					limit: () =>
						Promise.resolve([
							{
								id: 'g1',
								editTokenHash: null,
								intoxicationLevel: 2,
								videoTitle: 'V'
							}
						])
				})
			})
		});

		const result = await requireGameEdit(new Request('http://localhost'), 'g1');

		expect('response' in result).toBe(true);
		if (!('response' in result)) {
			return;
		}
		expect(result.response.status).toBe(403);
	});

	it('returns 403 when header token is missing', async () => {
		dbSelect.mockReturnValue({
			from: () => ({
				where: () => ({
					limit: () =>
						Promise.resolve([
							{
								id: 'g1',
								editTokenHash: hashEditToken('secret'),
								intoxicationLevel: 2,
								videoTitle: 'V'
							}
						])
				})
			})
		});

		const result = await requireGameEdit(new Request('http://localhost'), 'g1');

		expect('response' in result).toBe(true);
		if (!('response' in result)) {
			return;
		}
		expect(result.response.status).toBe(403);
	});

	it('returns game when token matches', async () => {
		const token = 'my-edit-token';
		dbSelect.mockReturnValue({
			from: () => ({
				where: () => ({
					limit: () =>
						Promise.resolve([
							{
								id: 'g1',
								editTokenHash: hashEditToken(token),
								intoxicationLevel: 2,
								videoTitle: 'V'
							}
						])
				})
			})
		});

		const result = await requireGameEdit(
			new Request('http://localhost', {
				headers: { [GAME_EDIT_TOKEN_HEADER]: token }
			}),
			'g1'
		);

		expect('game' in result).toBe(true);
		if (!('game' in result)) {
			return;
		}
		expect(result.game.id).toBe('g1');
	});
});
