import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from './AppShell';

vi.mock('@/components/AuthHeader', () => ({
	AuthHeader: () => <button type="button">Sign in with Discord</button>
}));

describe('AppShell', () => {
	it('renders navigation with Rules and a single My games link', () => {
		render(<AppShell><p>Content</p></AppShell>);

		const rulesLink = screen.getByRole('link', { name: 'Rules' });
		const myGamesLinks = screen.getAllByRole('link', { name: 'My games' });

		expect(rulesLink).toHaveAttribute('href', '/rules');
		expect(myGamesLinks).toHaveLength(1);
		expect(myGamesLinks[0]).toHaveAttribute('href', '/my-games');
	});

	it('uses responsive header layout classes', () => {
		const { container } = render(<AppShell><p>Content</p></AppShell>);

		const headerInner = container.querySelector('header > div');
		expect(headerInner?.className).toMatch(/max-sm:flex-col/);
		expect(headerInner?.className).toMatch(/flex-wrap/);
	});
});
