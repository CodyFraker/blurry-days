import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminRuleEditSheet } from './AdminRuleEditSheet';
import type { AdminRuleRow } from './AdminRulesTable';
import { DrinkEnum } from '@/lib/db/enums';

const baseRule: AdminRuleRow = {
	id: 'r1',
	text: 'When the host shows the camera',
	category: 'general',
	weight: 1.5,
	baseDrink: DrinkEnum.Sip,
	usageCount: 3,
	enabled: true,
	description: 'Count once.',
	thumbsUp: 0,
	thumbsDown: 0
};

describe('AdminRuleEditSheet', () => {
	afterEach(() => {
		cleanup();
	});

	it('submits updated rule text', async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);

		render(
			<AdminRuleEditSheet
				rule={baseRule}
				open={true}
				onOpenChange={vi.fn()}
				onSave={onSave}
				saving={false}
			/>
		);

		const textArea = screen.getByLabelText('Rule text');
		fireEvent.change(textArea, { target: { value: 'Updated rule text' } });
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

		await waitFor(() => {
			expect(onSave).toHaveBeenCalledWith('r1', {
				text: 'Updated rule text',
				category: 'general',
				weight: 1.5,
				baseDrink: DrinkEnum.Sip,
				enabled: true,
				description: 'Count once.'
			});
		});
	});
});
