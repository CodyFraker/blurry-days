import { json } from '@sveltejs/kit';
import { generateRulesForVideo } from '$lib/rules/ruleEngine';

export async function POST({ request }) {
	try {
		const { videoId, videoTitle, numberOfRules, intoxicationLevel } = await request.json();

		if (!videoId || !videoTitle || !numberOfRules || !intoxicationLevel) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Generate rules without creating a game
		const rules = await generateRulesForVideo({
			videoId,
			videoTitle,
			numberOfRules,
			intoxicationLevel
		});

		return json({ rules });
	} catch (error) {
		console.error('Error generating rules:', error);
		return json({ error: 'Failed to generate rules' }, { status: 500 });
	}
}