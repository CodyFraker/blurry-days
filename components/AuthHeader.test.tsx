import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Link from 'next/link';

import { AuthHeader } from './AuthHeader';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';



const signIn = vi.fn();

const signOut = vi.fn();

const useSession = vi.fn();



vi.mock('next-auth/react', () => ({

	signIn: (...args: unknown[]) => signIn(...args),

	signOut: (...args: unknown[]) => signOut(...args),

	useSession: () => useSession()

}));



function openAccountMenu() {

	const button = screen.getByRole('button', { name: /account menu/i });

	fireEvent.pointerDown(button, { button: 0, pointerType: 'mouse' });

	fireEvent.click(button);

}



describe('AuthHeader', () => {

	beforeEach(() => {

		vi.clearAllMocks();

	});



	afterEach(() => {

		cleanup();

	});



	it('shows loading skeleton while session loads', () => {

		useSession.mockReturnValue({ data: null, status: 'loading' });



		const { container } = render(<AuthHeader />);



		expect(container.querySelector('.animate-pulse')).toBeTruthy();

	});



	it('renders sign-in with touch-friendly mobile classes when unauthenticated', () => {

		useSession.mockReturnValue({ data: null, status: 'unauthenticated' });



		render(<AuthHeader />);



		const button = screen.getByRole('button');

		expect(button.className).toMatch(/min-h-11/);

		expect(button.className).toMatch(/whitespace-nowrap/);

	});



	it('renders account menu with my games link when authenticated', async () => {

		useSession.mockReturnValue({

			data: { user: { name: 'Test User', image: 'https://example.com/avatar.png' } },

			status: 'authenticated'

		});



		render(<AuthHeader />);



		openAccountMenu();



		await waitFor(() => {

			expect(document.querySelector('a[role="menuitem"][href="/my-games"]')).toBeTruthy();

		});

	});



	it('renders menu children when authenticated', async () => {

		useSession.mockReturnValue({

			data: { user: { name: 'Admin User', image: 'https://example.com/avatar.png' } },

			status: 'authenticated'

		});



		render(

			<AuthHeader>

				<DropdownMenuItem asChild>

					<Link href="/admin">Admin</Link>

				</DropdownMenuItem>

			</AuthHeader>

		);



		openAccountMenu();



		await waitFor(() => {

			expect(document.querySelector('a[role="menuitem"][href="/admin"]')).toBeTruthy();

		});

	});

});

