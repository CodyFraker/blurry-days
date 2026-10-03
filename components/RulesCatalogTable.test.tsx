import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { RulesCatalogTable } from './RulesCatalogTable';
import { DrinkEnum } from '@/lib/db/schema';

const baseRule = {
	id: 'r1',
	text: 'When the host shows the camera',
	category: 'general',
	weight: 1.5,
	baseDrink: DrinkEnum.Sip,
	usageCount: 3,
	createdAt: new Date('2024-01-15'),
	thumbsUp: 0,
	thumbsDown: 0
};

describe('RulesCatalogTable', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders table hidden below md breakpoint', () => {
		const { container } = render(
			<RulesCatalogTable rules={[{ ...baseRule, description: null }]} />
		);

		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper.className).toMatch(/hidden/);
		expect(wrapper.className).toMatch(/md:block/);
		expect(screen.getByRole('table')).toBeTruthy();
	});

	it('does not show expand affordance without description', () => {
		render(<RulesCatalogTable rules={[{ ...baseRule, description: null }]} />);

		expect(screen.queryByRole('button')).toBeNull();
	});
});
