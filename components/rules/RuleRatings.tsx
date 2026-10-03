export function RuleRatings({
	thumbsUp,
	thumbsDown,
	ariaLabel = 'Rule ratings'
}: {
	thumbsUp: number;
	thumbsDown: number;
	ariaLabel?: string;
}) {
	return (
		<div className="flex items-center gap-3 text-muted-foreground" aria-label={ariaLabel}>
			<span className="inline-flex items-center gap-1" title="Thumbs up">
				<span aria-hidden>👍</span>
				<span>{thumbsUp}</span>
			</span>
			<span className="inline-flex items-center gap-1" title="Thumbs down">
				<span aria-hidden>👎</span>
				<span>{thumbsDown}</span>
			</span>
		</div>
	);
}
