import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RulesCatalogCards } from './RulesCatalogCards';
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

describe('RulesCatalogCards', () => {
	it('renders rule text and category on mobile card list', () => {
		const { container } = render(<RulesCatalogCards rules={sampleRules} />);

		expect(container.querySelector('ul')?.className).toMatch(/md:hidden/);
		expect(screen.getByText('When the host shows the camera')).toBeTruthy();
		expect(screen.getByText('General')).toBeTruthy();
		expect(screen.getByText(/Used in 3 games/)).toBeTruthy();
	});
});
