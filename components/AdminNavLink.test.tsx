import { describe, it, expect, vi, beforeEach } from 'vitest';

import { render } from '@testing-library/react';

import { AdminNavLink } from './AdminNavLink';

import { DropdownMenu, DropdownMenuContent } from '@/components/ui/dropdown-menu';



const auth = vi.fn();

const isAdminUser = vi.fn();



vi.mock('@/lib/auth/config', () => ({

	auth: () => auth()

}));



vi.mock('@/lib/auth/isAdminUser', () => ({

	isAdminUser: (userId: string) => isAdminUser(userId)

}));



describe('AdminNavLink', () => {

	beforeEach(() => {

		auth.mockReset();

		isAdminUser.mockReset();

	});



	it('renders nothing when there is no session', async () => {

		auth.mockResolvedValue(null);



		const ui = await AdminNavLink();

		const { container } = render(ui);



		expect(container).toBeEmptyDOMElement();

	});



	it('renders nothing when user is not an admin', async () => {

		auth.mockResolvedValue({ user: { id: 'user-1' } });

		isAdminUser.mockResolvedValue(false);



		const ui = await AdminNavLink();

		const { container } = render(ui);



		expect(container).toBeEmptyDOMElement();

	});



	it('renders Admin link for admin users', async () => {

		auth.mockResolvedValue({ user: { id: 'user-1' } });

		isAdminUser.mockResolvedValue(true);



		const ui = await AdminNavLink();

		render(ui);



		expect(document.querySelector('a[href="/admin"]')).toBeTruthy();

	});



	it('renders Admin menu item for admin users when variant is menu', async () => {

		auth.mockResolvedValue({ user: { id: 'user-1' } });

		isAdminUser.mockResolvedValue(true);



		const ui = await AdminNavLink({ variant: 'menu' });

		render(

			<DropdownMenu open>

				<DropdownMenuContent>{ui}</DropdownMenuContent>

			</DropdownMenu>

		);



		expect(document.querySelector('a[role="menuitem"][href="/admin"]')).toBeTruthy();

	});

});

