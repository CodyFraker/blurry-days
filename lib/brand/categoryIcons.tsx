import type { ReactNode } from 'react';
import { CategoryEnum } from '@/lib/db/enums';

function IconSvg({ children }: { children: React.ReactNode }) {
	return (
		<svg
			className="h-4 w-4 shrink-0"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			{children}
		</svg>
	);
}

const icons: Record<string, ReactNode> = {
	[CategoryEnum.Camera]: (
		<IconSvg>
			<rect x="2" y="5" width="12" height="8" rx="1" className="stroke-current" strokeWidth="1.2" />
			<circle cx="8" cy="9" r="2" className="stroke-current" strokeWidth="1.2" />
		</IconSvg>
	),
	[CategoryEnum.Film]: (
		<IconSvg>
			<rect x="3" y="4" width="10" height="8" rx="1" className="stroke-current" strokeWidth="1.2" />
			<path d="M5 4V3M8 4V3M11 4V3" className="stroke-current" strokeWidth="1" />
		</IconSvg>
	),
	[CategoryEnum.Technique]: (
		<IconSvg>
			<path d="M3 12L8 4L13 12" className="stroke-current" strokeWidth="1.2" fill="none" />
		</IconSvg>
	),
	[CategoryEnum.Location]: (
		<IconSvg>
			<path
				d="M8 2C6 2 4.5 4 4.5 6c0 3 3.5 7 3.5 7s3.5-4 3.5-7c0-2-1.5-4-3.5-4z"
				className="stroke-current"
				strokeWidth="1.2"
				fill="none"
			/>
		</IconSvg>
	),
	[CategoryEnum.Equipment]: (
		<IconSvg>
			<path d="M4 10h8M6 6l4 8M10 6l-4 8" className="stroke-current" strokeWidth="1.2" />
		</IconSvg>
	),
	[CategoryEnum.General]: (
		<IconSvg>
			<circle cx="8" cy="8" r="5" className="stroke-current" strokeWidth="1.2" />
		</IconSvg>
	)
};

export function CategoryIcon({ category }: { category: string }) {
	return (
		<span className="inline-flex text-gray-600 dark:text-gray-300">
			{icons[category] ?? icons[CategoryEnum.General]}
		</span>
	);
}
