'use client';

import { usePathname } from 'next/navigation';

export function FilmGrainOverlay() {
	const pathname = usePathname();
	if (pathname?.startsWith('/admin')) {
		return null;
	}

	return (
		<div
			className="film-grain-overlay pointer-events-none fixed inset-0 z-[1]"
			aria-hidden
		/>
	);
}
