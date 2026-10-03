import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { RulesCatalogCards } from './RulesCatalogCards';
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

describe('RulesCatalogCards', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders mobile card list below md breakpoint', () => {
		const { container } = render(
			<RulesCatalogCards rules={[{ ...baseRule, description: null }]} />
		);

		expect(container.querySelector('ul')?.className).toMatch(/md:hidden/);
	});
});
