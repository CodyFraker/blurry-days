type Variant = 'noGames' | 'noVideoGames' | 'endOfRoll' | 'signIn';

const labels: Record<Variant, string> = {
	noGames: 'Empty film canister',
	noVideoGames: 'Blank contact sheet',
	endOfRoll: 'End of film roll',
	signIn: 'Camera ready'
};

export function EmptyStateIllustration({
	variant,
	className = 'mx-auto h-24 w-24 text-gray-400 dark:text-gray-500'
}: {
	variant: Variant;
	className?: string;
}) {
	const title = labels[variant];

	return (
		<svg
			className={className}
			viewBox="0 0 96 96"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label={title}
		>
			{variant === 'endOfRoll' ? (
				<>
					<rect x="12" y="28" width="72" height="40" rx="4" className="stroke-current" strokeWidth="2" />
					{[0, 1, 2, 3, 4].map((i) => (
						<rect
							key={i}
							x={18 + i * 14}
							y="22"
							width="6"
							height="8"
							rx="1"
							className="fill-current opacity-50"
						/>
					))}
					<text x="48" y="54" textAnchor="middle" className="fill-current text-[10px] font-mono">
						END
					</text>
				</>
			) : variant === 'signIn' ? (
				<>
					<rect x="20" y="32" width="56" height="36" rx="3" className="stroke-current" strokeWidth="2" />
					<circle cx="48" cy="50" r="10" className="stroke-current" strokeWidth="2" />
				</>
			) : (
				<>
					<ellipse cx="48" cy="52" rx="22" ry="26" className="stroke-current" strokeWidth="2" />
					<circle cx="48" cy="52" r="10" className="stroke-current" strokeWidth="1.5" />
					{variant === 'noVideoGames' ? (
						<rect x="30" y="20" width="36" height="28" rx="2" className="stroke-current opacity-60" strokeWidth="1.5" strokeDasharray="4 3" />
					) : null}
				</>
			)}
		</svg>
	);
}
