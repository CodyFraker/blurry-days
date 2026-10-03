import type { ReactNode } from 'react';

const sizeClasses = {
	sm: 'h-[4.5rem] w-[8rem]',
	md: 'h-[7.5rem] w-[10rem] sm:h-24 sm:w-40',
	lg: 'mx-auto w-full max-w-[300px] aspect-[4/3]'
} as const;

export function ViewfinderFrame({
	children,
	size = 'sm',
	className = '',
	frameNumber
}: {
	children: ReactNode;
	size?: keyof typeof sizeClasses;
	className?: string;
	frameNumber?: string;
}) {
	return (
		<div
			className={`relative shrink-0 overflow-hidden rounded-md bg-black ${sizeClasses[size]} ${className}`}
		>
			{children}
			<span
				className="pointer-events-none absolute left-1 top-1 h-2.5 w-2.5 border-l-2 border-t-2 border-white/80"
				aria-hidden
			/>
			<span
				className="pointer-events-none absolute right-1 top-1 h-2.5 w-2.5 border-r-2 border-t-2 border-white/80"
				aria-hidden
			/>
			<span
				className="pointer-events-none absolute bottom-1 left-1 h-2.5 w-2.5 border-b-2 border-l-2 border-white/80"
				aria-hidden
			/>
			<span
				className="pointer-events-none absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-white/80"
				aria-hidden
			/>
			{frameNumber ? (
				<span
					className="pointer-events-none absolute bottom-1 right-2 font-mono text-[10px] tabular-nums text-white/70"
					aria-hidden
				>
					{frameNumber}
				</span>
			) : null}
		</div>
	);
}
