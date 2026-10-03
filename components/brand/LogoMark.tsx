export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			<rect x="4" y="10" width="24" height="16" rx="2" className="stroke-current" strokeWidth="1.5" />
			<circle cx="16" cy="18" r="5" className="stroke-current" strokeWidth="1.5" />
			<circle cx="16" cy="18" r="2" className="fill-current opacity-60" />
			<rect x="10" y="6" width="6" height="4" rx="1" className="fill-current opacity-80" />
			<circle cx="24" cy="13" r="1.25" className="fill-current" />
		</svg>
	);
}
