import type { FilmFormat } from '@/lib/brand/filmFormats';

const sizes: Record<FilmFormat['aspect'], string> = {
	panoramic: 'h-2 w-8',
	box: 'h-5 w-5',
	land: 'h-5 w-4',
	square: 'h-4 w-4',
	medium: 'h-4 w-5',
	'35mm': 'h-3 w-5'
};

export function FormatAspectIcon({ aspect }: { aspect: FilmFormat['aspect'] }) {
	return (
		<span
			className={`inline-block shrink-0 rounded-sm border border-current opacity-80 ${sizes[aspect]}`}
			aria-hidden
		/>
	);
}
