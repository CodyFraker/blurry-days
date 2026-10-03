import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Grainydays Drinking Game Generator';

export default function OpenGraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					background: '#111827',
					color: '#f9fafb',
					fontFamily: 'system-ui, sans-serif'
				}}
			>
				<div style={{ fontSize: 56, fontWeight: 700, color: '#a5b4fc' }}>Grainydays</div>
				<div style={{ marginTop: 16, fontSize: 28, color: '#9ca3af' }}>Drinking Game Generator</div>
				<div style={{ marginTop: 24, fontSize: 20, color: '#6b7280' }}>Film photography videos</div>
			</div>
		),
		{ ...size }
	);
}
