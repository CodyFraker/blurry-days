import cron from 'node-cron';
import { syncChannelVideos } from '@/lib/youtube/syncChannelVideos';

let scheduled = false;

export function scheduleVideoSyncIfConfigured(): void {
	if (scheduled) {
		return;
	}

	const expression = process.env.VIDEO_SYNC_CRON?.trim();
	if (!expression) {
		return;
	}

	if (!cron.validate(expression)) {
		console.error('[video-sync] invalid VIDEO_SYNC_CRON expression:', expression);
		return;
	}

	scheduled = true;
	cron.schedule(expression, () => {
		void syncChannelVideos({ force: false, includeHidden: false }).catch((error) => {
			console.error('[video-sync] scheduled sync failed:', error);
		});
	});
}
