export function ShutterIcon({ className = 'h-5 w-5' }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			<circle cx="12" cy="12" r="8" className="stroke-current" strokeWidth="1.75" />
			<path
				d="M12 4v3M12 17v3M4 12h3M17 12h3"
				className="stroke-current"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<circle cx="12" cy="12" r="2.5" className="fill-current" />
		</svg>
	);
}
