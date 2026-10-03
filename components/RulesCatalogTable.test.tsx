import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RulesCatalogTable } from './RulesCatalogTable';
import { DrinkEnum } from '@/lib/db/schema';

const sampleRules = [
	{
		id: 'r1',
		text: 'When the host shows the camera',
		category: 'general',
		weight: 1.5,
		baseDrink: DrinkEnum.Sip,
		usageCount: 3,
		createdAt: new Date('2024-01-15'),
		thumbsUp: 0,
		thumbsDown: 0
	}
];

describe('RulesCatalogTable', () => {
	it('renders table hidden below md breakpoint', () => {
		const { container } = render(<RulesCatalogTable rules={sampleRules} />);

		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper.className).toMatch(/hidden/);
		expect(wrapper.className).toMatch(/md:block/);
		expect(screen.getByRole('table')).toBeTruthy();
		expect(screen.getByText('When the host shows the camera')).toBeTruthy();
	});
});
