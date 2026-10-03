import Link from 'next/link';
import { auth } from '@/lib/auth/config';
import { isAdminUser } from '@/lib/auth/isAdminUser';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

const navLinkClass =
	'text-sm font-medium text-gray-600 hover:text-indigo-700 dark:text-gray-300 dark:hover:text-indigo-300';

type AdminNavLinkProps = {
	variant?: 'nav' | 'menu';
};

export async function AdminNavLink({ variant = 'nav' }: AdminNavLinkProps = {}) {
	const session = await auth();
	if (!session?.user?.id) {
		return null;
	}

	const admin = await isAdminUser(session.user.id);
	if (!admin) {
		return null;
	}

	if (variant === 'menu') {
		return (
			<DropdownMenuItem asChild>
				<Link href="/admin">Admin</Link>
			</DropdownMenuItem>
		);
	}

	return (
		<Link href="/admin" className={navLinkClass}>
			Admin
		</Link>
	);
}
