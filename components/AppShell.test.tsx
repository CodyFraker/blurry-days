import { afterEach, describe, it, expect, vi } from 'vitest';

import { cleanup, render, screen } from '@testing-library/react';

import Link from 'next/link';

import { AppShell } from './AppShell';



const adminNavLinkState = vi.hoisted(() => ({

	showLink: false

}));



vi.mock('@/components/AuthHeader', () => ({

	AuthHeader: ({ children }: { children?: React.ReactNode }) => (

		<div data-testid="auth-header">

			<button type="button">Sign in with Discord</button>

			{children}

		</div>

	)

}));



vi.mock('@/components/AdminNavLink', () => ({

	AdminNavLink: () =>

		adminNavLinkState.showLink ? <Link href="/admin">Admin</Link> : null

}));



describe('AppShell', () => {

	afterEach(() => {

		cleanup();

	});



	it('renders rules nav link without my games in main nav', () => {

		adminNavLinkState.showLink = false;

		render(

			<AppShell>

				<p>Content</p>

			</AppShell>

		);



		expect(document.querySelector('nav a[href="/rules"]')).toBeTruthy();

		expect(document.querySelector('a[href="/my-games"]')).toBeNull();

	});



	it('renders Admin link inside AuthHeader when AdminNavLink is shown', () => {

		adminNavLinkState.showLink = true;

		render(

			<AppShell>

				<p>Content</p>

			</AppShell>

		);



		const adminLink = document.querySelector('[data-testid="auth-header"] a[href="/admin"]');

		expect(adminLink).toBeTruthy();

		expect(screen.getByTestId('auth-header')).toContainElement(adminLink);

		adminNavLinkState.showLink = false;

	});



	it('keeps logo and nav on one row at narrow widths', () => {

		adminNavLinkState.showLink = false;

		const { container } = render(

			<AppShell>

				<p>Content</p>

			</AppShell>

		);



		const headerInner = container.querySelector('header > div');

		expect(headerInner?.className).toMatch(/flex-nowrap/);

		expect(headerInner?.className).not.toMatch(/max-sm:flex-col/);

	});

});

