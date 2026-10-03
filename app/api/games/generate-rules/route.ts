import { NextResponse } from 'next/server';
import { generateRulesForVideo } from '@/lib/rules/ruleEngine';

export async function POST(request: Request) {
	try {
		const { videoId, videoTitle, numberOfRules, intoxicationLevel } = await request.json();

		if (!videoId || !videoTitle || !numberOfRules || !intoxicationLevel) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const rules = await generateRulesForVideo({
			videoId,
			videoTitle,
			numberOfRules,
			intoxicationLevel
		});

		return NextResponse.json({ rules });
	} catch (error) {
		console.error('Error generating rules:', error);
		return NextResponse.json({ error: 'Failed to generate rules' }, { status: 500 });
	}
}
