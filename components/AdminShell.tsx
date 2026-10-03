'use client';

import { usePathname } from 'next/navigation';
import { AdminSubNav } from '@/components/AdminSubNav';

export function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	return (
		<div className="space-y-6">
			<AdminSubNav pathname={pathname} />
			{children}
		</div>
	);
}
