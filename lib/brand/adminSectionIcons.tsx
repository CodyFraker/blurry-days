export function AdminSectionIcon({ id }: { id: string }) {
	const className = 'mr-2 inline-block h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400';

	switch (id) {
		case 'rules':
			return (
				<svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
					<rect x="3" y="4" width="14" height="12" rx="1" className="stroke-current" strokeWidth="1.5" />
					<path d="M6 8h8M6 11h6" className="stroke-current" strokeWidth="1.2" />
				</svg>
			);
		case 'games':
			return (
				<svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
					<rect x="4" y="5" width="12" height="10" rx="1" className="stroke-current" strokeWidth="1.5" />
					<circle cx="10" cy="10" r="2" className="stroke-current" strokeWidth="1.2" />
				</svg>
			);
		case 'videos':
			return (
				<svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
					<path d="M3 6h10v8H3z" className="stroke-current" strokeWidth="1.5" />
					<path d="M13 8l4-2v8l-4-2" className="stroke-current" strokeWidth="1.5" />
				</svg>
			);
		case 'votes':
			return (
				<svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
					<path d="M6 14V8l-2 2M14 14V8l2 2" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" />
				</svg>
			);
		default:
			return (
				<svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
					<circle cx="10" cy="10" r="6" className="stroke-current" strokeWidth="1.5" />
					<path d="M10 7v3l2 2" className="stroke-current" strokeWidth="1.2" />
				</svg>
			);
	}
}
