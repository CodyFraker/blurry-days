import type { Metadata } from 'next';
import { AdminForbidden } from '@/components/AdminForbidden';
import { AdminShell } from '@/components/AdminShell';
import { auth, signIn } from '@/lib/auth/config';
import { isAdminUser } from '@/lib/auth/isAdminUser';

export const metadata: Metadata = {
	title: 'Admin'
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const session = await auth();
	if (!session?.user?.id) {
		await signIn('discord', { redirectTo: '/admin' });
		return null;
	}

	const admin = await isAdminUser(session.user.id);
	if (!admin) {
		return <AdminForbidden />;
	}

	return <AdminShell>{children}</AdminShell>;
}
