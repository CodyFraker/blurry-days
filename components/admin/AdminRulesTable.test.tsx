import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AdminRulesTable, type AdminRuleRow } from './AdminRulesTable';
import { DrinkEnum } from '@/lib/db/enums';

const baseRule: AdminRuleRow = {
	id: 'r1',
	text: 'When the host shows the camera',
	category: 'general',
	weight: 1.5,
	baseDrink: DrinkEnum.Sip,
	usageCount: 3,
	enabled: true,
	description: null,
	thumbsUp: 2,
	thumbsDown: 1
};

describe('AdminRulesTable', () => {
	afterEach(() => {
		cleanup();
	});

	it('calls onEdit when edit button is clicked', () => {
		const onEdit = vi.fn();

		render(
			<AdminRulesTable
				rules={[baseRule]}
				onEdit={onEdit}
				onToggleEnabled={vi.fn()}
				onDelete={vi.fn()}
				togglingId={null}
			/>
		);

		fireEvent.click(screen.getByLabelText('Edit rule'));

		expect(onEdit).toHaveBeenCalledWith(baseRule);
	});
});
