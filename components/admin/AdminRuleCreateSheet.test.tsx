import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminRuleCreateSheet } from './AdminRuleCreateSheet';
import { DrinkEnum } from '@/lib/db/enums';

describe('AdminRuleCreateSheet', () => {
	afterEach(() => {
		cleanup();
	});

	it('submits new rule and closes sheet', async () => {
		const onCreate = vi.fn().mockResolvedValue(true);

		render(
			<AdminRuleCreateSheet open={true} onOpenChange={vi.fn()} onCreate={onCreate} saving={false} />
		);

		const textArea = screen.getByLabelText('Rule text');
		fireEvent.change(textArea, { target: { value: 'New rule text' } });
		fireEvent.click(screen.getByRole('button', { name: 'Create rule' }));

		await waitFor(() => {
			expect(onCreate).toHaveBeenCalledWith(
				{
					text: 'New rule text',
					category: 'general',
					weight: 1,
					baseDrink: DrinkEnum.Sip,
					enabled: true,
					description: null
				},
				false
			);
		});
	});

	it('submits with add another flag', async () => {
		const onCreate = vi.fn().mockResolvedValue(true);

		render(
			<AdminRuleCreateSheet open={true} onOpenChange={vi.fn()} onCreate={onCreate} saving={false} />
		);

		const textArea = screen.getByLabelText('Rule text');
		fireEvent.change(textArea, { target: { value: 'Another rule' } });
		fireEvent.click(screen.getByRole('button', { name: 'Create and add another' }));

		await waitFor(() => {
			expect(onCreate).toHaveBeenCalledWith(
				expect.objectContaining({ text: 'Another rule' }),
				true
			);
		});

		expect(screen.getByRole('status')).toHaveTextContent('Rule added');
		expect(screen.getByLabelText('Rule text')).toHaveValue('');
	});

	it('keeps draft fields when the sheet is closed and reopened', () => {
		const onOpenChange = vi.fn();

		const { rerender } = render(
			<AdminRuleCreateSheet
				open={true}
				onOpenChange={onOpenChange}
				onCreate={vi.fn()}
				saving={false}
			/>
		);

		fireEvent.change(screen.getByLabelText('Rule text'), { target: { value: 'Draft rule' } });

		rerender(
			<AdminRuleCreateSheet
				open={false}
				onOpenChange={onOpenChange}
				onCreate={vi.fn()}
				saving={false}
			/>
		);

		rerender(
			<AdminRuleCreateSheet
				open={true}
				onOpenChange={onOpenChange}
				onCreate={vi.fn()}
				saving={false}
			/>
		);

		expect(screen.getByLabelText('Rule text')).toHaveValue('Draft rule');
	});
});
