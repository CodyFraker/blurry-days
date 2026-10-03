import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Link from 'next/link';
import { AppShell } from './AppShell';

const adminNavLinkState = vi.hoisted(() => ({
	showLink: false
}));

vi.mock('@/components/AuthHeader', () => ({
	AuthHeader: () => <button type="button">Sign in with Discord</button>
}));

vi.mock('@/components/AdminNavLink', () => ({
	AdminNavLink: () =>
		adminNavLinkState.showLink ? <Link href="/admin">Admin</Link> : null
}));

describe('AppShell', () => {
	it('renders navigation with Rules and a single My games link', () => {
		adminNavLinkState.showLink = false;
		render(
			<AppShell>
				<p>Content</p>
			</AppShell>
		);

		const rulesLink = screen.getByRole('link', { name: 'Rules' });
		const myGamesLinks = screen.getAllByRole('link', { name: 'My games' });

		expect(rulesLink).toHaveAttribute('href', '/rules');
		expect(myGamesLinks).toHaveLength(1);
		expect(myGamesLinks[0]).toHaveAttribute('href', '/my-games');
	});

	it('renders Admin link when AdminNavLink is shown', () => {
		adminNavLinkState.showLink = true;
		render(
			<AppShell>
				<p>Content</p>
			</AppShell>
		);

		const adminLink = screen.getByRole('link', { name: 'Admin' });
		expect(adminLink).toHaveAttribute('href', '/admin');
		adminNavLinkState.showLink = false;
	});

	it('uses responsive header layout classes', () => {
		adminNavLinkState.showLink = false;
		const { container } = render(
			<AppShell>
				<p>Content</p>
			</AppShell>
		);

		const headerInner = container.querySelector('header > div');
		expect(headerInner?.className).toMatch(/max-sm:flex-col/);
		expect(headerInner?.className).toMatch(/flex-wrap/);
	});
});
