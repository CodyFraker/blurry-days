import { ImageResponse } from 'next/og';
import { getPlayableGame } from '@/lib/games/getPlayableGame';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Grainydays drinking game';

export default async function OpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const game = await getPlayableGame(id);

	const title = game?.title ?? 'Grainydays Drinking Game';
	const videoTitle = game?.videoTitle ?? 'Film photography video';
	const thumb = game?.videoThumbnail;

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					background: '#111827',
					color: '#f9fafb',
					padding: 48,
					fontFamily: 'system-ui, sans-serif'
				}}
			>
				<div style={{ fontSize: 28, fontWeight: 700, color: '#a5b4fc' }}>Grainydays</div>
				<div style={{ marginTop: 32, display: 'flex', gap: 32, alignItems: 'center', flex: 1 }}>
					{thumb ? (
						<div
							style={{
								position: 'relative',
								width: 320,
								height: 200,
								background: '#000',
								borderRadius: 8,
								overflow: 'hidden',
								display: 'flex'
							}}
						>
							<img src={thumb} alt="" width={320} height={200} style={{ objectFit: 'cover' }} />
							<div
								style={{
									position: 'absolute',
									left: 8,
									top: 8,
									width: 24,
									height: 24,
									borderLeft: '3px solid rgba(255,255,255,0.8)',
									borderTop: '3px solid rgba(255,255,255,0.8)'
								}}
							/>
							<div
								style={{
									position: 'absolute',
									right: 8,
									top: 8,
									width: 24,
									height: 24,
									borderRight: '3px solid rgba(255,255,255,0.8)',
									borderTop: '3px solid rgba(255,255,255,0.8)'
								}}
							/>
						</div>
					) : null}
					<div style={{ display: 'flex', flexDirection: 'column', maxWidth: 720 }}>
						<div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
						<div style={{ marginTop: 16, fontSize: 24, color: '#9ca3af' }}>{videoTitle}</div>
					</div>
				</div>
			</div>
		),
		{ ...size }
	);
}
