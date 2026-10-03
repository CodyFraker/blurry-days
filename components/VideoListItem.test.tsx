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
import { getYoutubeWatchUrl } from '@/lib/youtube/watchUrl';

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

	it('renders games link and create action', () => {
		render(<VideoListItem video={video} onCreateGame={vi.fn()} />);

		expect(screen.getByRole('link', { name: '2 games' })).toHaveAttribute(
			'href',
			'/videos/v1/games'
		);
	});

	it('renders YouTube watch link that opens in a new tab', () => {
		render(<VideoListItem video={video} onCreateGame={vi.fn()} />);

		const watchLink = screen.getByRole('link', {
			name: 'Watch Test Video on YouTube'
		});

		expect(watchLink).toHaveAttribute('href', getYoutubeWatchUrl('v1'));
		expect(watchLink).toHaveAttribute('target', '_blank');
		expect(watchLink).toHaveAttribute('rel', 'noopener noreferrer');
	});

	it('lazy-loads thumbnail from YouTube mqdefault URL', () => {
		const { container } = render(<VideoListItem video={video} onCreateGame={vi.fn()} />);

		const img = container.querySelector('img');
		expect(img).toHaveAttribute('loading', 'lazy');
		expect(img).toHaveAttribute('src', `${YOUTUBE_THUMBNAIL_HOST}/vi/v1/mqdefault.jpg`);
	});

	it('hides publish date and views below the sm breakpoint', () => {
		const { container } = render(<VideoListItem video={video} onCreateGame={vi.fn()} />);

		const meta = container.querySelector('p.text-sm');
		const collapsible = meta?.querySelectorAll('.max-sm\\:hidden');

		expect(collapsible?.length).toBe(2);
		expect(screen.getByRole('link', { name: '2 games' })).toHaveTextContent('2 games');
	});
});
