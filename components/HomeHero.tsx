import type { ReactNode } from 'react';
import { FilmPerforationDivider } from '@/components/brand/FilmPerforationDivider';

export function HomeHero({
	title,
	description,
	meta
}: {
	title: string;
	description: string;
	meta?: ReactNode;
}) {
	return (
		<div className="mb-8 sm:mb-12">
			<div className="relative overflow-hidden rounded-2xl px-4 py-8 sm:px-8 sm:py-10">
				<div
					className="pointer-events-none absolute inset-0 hidden bg-cover bg-center opacity-30 sm:block"
					style={{ backgroundImage: "url('/brand/hero.svg')" }}
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-50/95 via-gray-50/90 to-gray-50 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900"
					aria-hidden
				/>
				<div className="relative text-center">
					<h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">{title}</h2>
					<p className="mx-auto mt-2 max-w-xl text-gray-600 dark:text-gray-400">{description}</p>
					{meta ? <div className="mt-1">{meta}</div> : null}
				</div>
			</div>
			<FilmPerforationDivider className="mt-6" />
		</div>
	);
}
