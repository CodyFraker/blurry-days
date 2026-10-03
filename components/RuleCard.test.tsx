import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { RuleCard } from './RuleCard';
import { DrinkEnum } from '@/lib/db/schema';

describe('RuleCard', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders custom badge with mobile-friendly positioning classes', () => {
		const { container } = render(
			<RuleCard
				rule={{
					id: '1',
					text: 'Custom rule text',
					category: 'general',
					baseDrink: DrinkEnum.Sip,
					isCustom: true
				}}
				index={0}
			/>
		);

		const badge = container.querySelector('.bg-emerald-500');
		expect(badge?.className).toMatch(/max-sm:static/);
		expect(badge?.className).toMatch(/sm:absolute/);
	});

	it('renders action slot', () => {
		render(
			<RuleCard
				rule={{
					id: '1',
					text: 'Rule',
					category: 'general',
					baseDrink: DrinkEnum.Sip
				}}
				index={0}
				actions={
					<button type="button" className="min-h-11 min-w-11" aria-label="Reroll rule">
						Reroll
					</button>
				}
			/>
		);

		expect(screen.getByRole('button', { name: 'Reroll rule' })).toBeTruthy();
	});

	it('omits guidance block when description is absent', () => {
		render(
			<RuleCard
				rule={{
					id: '1',
					text: 'Rule only',
					category: 'general',
					baseDrink: DrinkEnum.Sip
				}}
				index={0}
			/>
		);

		expect(screen.queryByTestId('rule-guidance')).toBeNull();
	});
});
