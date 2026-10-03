export type FilmFormat = {
	label: string;
	value: number;
	aspect: 'panoramic' | 'box' | 'land' | 'square' | 'medium' | '35mm';
};

export const filmFormats: FilmFormat[] = [
	{ label: 'Panoramic', value: 3, aspect: 'panoramic' },
	{ label: 'Box Camera', value: 6, aspect: 'box' },
	{ label: 'Land Camera', value: 8, aspect: 'land' },
	{ label: 'Square Format', value: 12, aspect: 'square' },
	{ label: 'Medium Format', value: 18, aspect: 'medium' },
	{ label: '35mm', value: 36, aspect: '35mm' }
];
