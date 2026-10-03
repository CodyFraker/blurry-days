import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { AuthHeader } from './AuthHeader';

const signIn = vi.fn();
const signOut = vi.fn();
const useSession = vi.fn();

vi.mock('next-auth/react', () => ({
	signIn: (...args: unknown[]) => signIn(...args),
	signOut: (...args: unknown[]) => signOut(...args),
	useSession: () => useSession()
}));

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

		const button = screen.getByRole('button', { name: /sign in with discord/i });
		expect(button.className).toMatch(/min-h-11/);
		expect(button.className).toMatch(/w-full/);
		expect(button.className).toMatch(/sm:w-auto/);
	});

	it('renders avatar and sign out only when authenticated', () => {
		useSession.mockReturnValue({
			data: { user: { image: 'https://example.com/avatar.png' } },
			status: 'authenticated'
		});

		const { container } = render(<AuthHeader />);

		expect(screen.queryByRole('link', { name: /my games/i })).toBeNull();
		expect(screen.getByRole('button', { name: /sign out/i })).toBeTruthy();
		expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/avatar.png');
	});
});
