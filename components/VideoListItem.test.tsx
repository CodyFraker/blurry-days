import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { VideoListItem } from './VideoListItem';

vi.mock('next/link', () => ({
	default: ({
		children,
		href,
		...props
	}: {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	)
}));
import { YOUTUBE_THUMBNAIL_HOST } from '@/lib/youtube/thumbnailUrl';

const video = {
	id: 'v1',
	title: 'Test Video',
	thumbnail: 'https://example.com/thumb.jpg',
	gameCount: 2,
	description: 'Summary\n\nDuration: 10:00\nViews: 1,234',
	publishedAt: new Date('2024-06-15T12:00:00Z'),
	lastFetched: new Date()
};

describe('VideoListItem', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders title, meta line, and accessible create button', () => {
		render(<VideoListItem video={video} onCreateGame={vi.fn()} />);

		expect(screen.getByText('Test Video')).toBeInTheDocument();
		const gamesLink = screen.getByRole('link', { name: '2 games' });
		expect(gamesLink).toHaveAttribute('href', '/videos/v1/games');
		expect(screen.getByText(/10:00/)).toBeInTheDocument();
		expect(screen.getByText(/1,234 views/)).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Create game for Test Video' })
		).toBeInTheDocument();
	});

	it('lazy-loads thumbnail from YouTube mqdefault URL', () => {
		const { container } = render(<VideoListItem video={video} onCreateGame={vi.fn()} />);

		const img = container.querySelector('img');
		expect(img).toHaveAttribute('loading', 'lazy');
		expect(img).toHaveAttribute('src', `${YOUTUBE_THUMBNAIL_HOST}/vi/v1/mqdefault.jpg`);
	});
});
