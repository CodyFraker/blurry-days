import VideoGamesPageClient from './VideoGamesPageClient';

type VideoGamesPageProps = {
	params: Promise<{ videoId: string }>;
};

export default async function VideoGamesPage({ params }: VideoGamesPageProps) {
	const { videoId } = await params;
	return <VideoGamesPageClient videoId={videoId} />;
}
