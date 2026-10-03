export function ShutterSpinner({ className = 'h-5 w-5' }: { className?: string }) {
	return (
		<svg
			className={`shutter-spinner text-blue-500 dark:text-blue-400 ${className}`}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
		>
			<circle cx="12" cy="12" r="9" className="stroke-current opacity-30" strokeWidth="1.5" />
			<path
				d="M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21M5.6 5.6l3.2 3.2M15.2 15.2l3.2 3.2M5.6 18.4l3.2-3.2M15.2 8.8l3.2-3.2"
				className="stroke-current"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<circle cx="12" cy="12" r="2.5" className="fill-current" />
		</svg>
	);
}
