export type YoutubeVideoClient = {
	id: string;
	title: string;
	thumbnail: string | null;
	publishedAt: string;
	description: string | null;
	lastFetched: string;
	isHidden: boolean;
	sortOrder: number | null;
};
