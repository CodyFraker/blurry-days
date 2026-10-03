export type YoutubeThumbnailVariant = 'mqdefault' | 'maxresdefault' | 'hqdefault';

export const YOUTUBE_THUMBNAIL_HOST = 'https://i.ytimg.com';

export function getYoutubeThumbnailUrl(
	videoId: string,
	variant: YoutubeThumbnailVariant = 'mqdefault'
): string {
	return `${YOUTUBE_THUMBNAIL_HOST}/vi/${videoId}/${variant}.jpg`;
}

export function getYoutubeThumbnailFallbackUrls(
	videoId: string,
	storedUrl?: string | null
): string[] {
	const urls = [
		getYoutubeThumbnailUrl(videoId, 'mqdefault'),
		getYoutubeThumbnailUrl(videoId, 'maxresdefault'),
		storedUrl?.trim() || ''
	];
	return [...new Set(urls.filter(Boolean))];
}
