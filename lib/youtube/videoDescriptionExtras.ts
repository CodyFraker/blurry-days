export type VideoDescriptionExtras = {
	duration?: string;
	views?: string;
	likes?: string;
};

const DURATION_LINE = /(?:^|\n)Duration:\s*(.+?)(?:\n|$)/;
const VIEWS_LINE = /(?:^|\n)Views:\s*(.+?)(?:\n|$)/;
const LIKES_LINE = /(?:^|\n)Likes:\s*(.+?)(?:\n|$)/;

export function parseVideoDescriptionExtras(
	description: string | null | undefined
): VideoDescriptionExtras {
	if (!description) {
		return {};
	}

	const extras: VideoDescriptionExtras = {};
	const durationMatch = description.match(DURATION_LINE);
	const viewsMatch = description.match(VIEWS_LINE);
	const likesMatch = description.match(LIKES_LINE);

	if (durationMatch?.[1]) {
		extras.duration = durationMatch[1].trim();
	}
	if (viewsMatch?.[1]) {
		extras.views = viewsMatch[1].trim();
	}
	if (likesMatch?.[1]) {
		extras.likes = likesMatch[1].trim();
	}

	return extras;
}

export function formatVideoMetaSegments(
	publishedAt: Date,
	gameCount: number,
	extras: VideoDescriptionExtras
): string[] {
	const segments: string[] = [publishedAt.toLocaleDateString()];
	segments.push(`${gameCount} ${gameCount === 1 ? 'game' : 'games'}`);
	if (extras.duration) {
		segments.push(extras.duration);
	}
	if (extras.views) {
		segments.push(`${extras.views} views`);
	}
	return segments;
}
