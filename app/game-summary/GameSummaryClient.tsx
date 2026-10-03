'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import type { YoutubeVideo } from '@/lib/db/schema';
import { CategoryEnum, DrinkEnum } from '@/lib/db/schema';
import { getDrinkName } from '@/lib/rules/drinks';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorPanel } from '@/components/ErrorPanel';
import { GameSummaryStickyActions } from '@/components/GameSummaryStickyActions';
import { RuleCard, type RuleView } from '@/components/RuleCard';
import { FormatAspectIcon } from '@/components/brand/FormatAspectIcon';
import { IsoTopPlate } from '@/components/brand/IsoTopPlate';
import { ShutterSpinner } from '@/components/brand/ShutterSpinner';
import { ViewfinderFrame } from '@/components/brand/ViewfinderFrame';
import { filmFormats } from '@/lib/brand/filmFormats';
import { getYoutubeThumbnailUrl } from '@/lib/youtube/thumbnailUrl';

const isoValues: (number | 'PROGRAM')[] = [100, 200, 400, 800, 1600, 'PROGRAM'];

type Rule = RuleView;

export default function GameSummaryClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [videos, setVideos] = useState<YoutubeVideo[]>([]);
	const [gameSettings, setGameSettings] = useState<{
		videoId: string;
		videoTitle: string;
		videoThumbnail: string | null;
		intoxicationLevel: number;
		numberOfRules: number;
	} | null>(null);
	const [rules, setRules] = useState<Rule[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [isGeneratingRules, setIsGeneratingRules] = useState(false);
	const [isRerolling, setIsRerolling] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [rerollingRules, setRerollingRules] = useState<Set<string>>(new Set());
	const [isoIndex, setIsoIndex] = useState(0);
	const [selectedFormatIndex, setSelectedFormatIndex] = useState(3);
	const [customRuleText, setCustomRuleText] = useState('');
	const [customRuleCategory, setCustomRuleCategory] = useState<string>(CategoryEnum.General);
	const [customRuleDrink, setCustomRuleDrink] = useState<number>(DrinkEnum.Sip);
	const [customModalOpen, setCustomModalOpen] = useState(false);
	const [videoModalOpen, setVideoModalOpen] = useState(false);

	const selectedFormat = filmFormats[selectedFormatIndex];
	const intoxicationLevel = isoIndex + 1;
	const numberOfRules = selectedFormat.value;

	useEffect(() => {
		(async () => {
			try {
				const response = await fetch('/api/videos');
				if (!response.ok) throw new Error('Failed to fetch videos');
				const list = await response.json();
				setVideos(list);
				const videoId = searchParams.get('videoId');
				if (!videoId) {
					router.replace('/');
					return;
				}
				const video = list.find((v: YoutubeVideo) => v.id === videoId);
				if (!video) {
					setError('Video not found');
					return;
				}
				setGameSettings({
					videoId: video.id,
					videoTitle: video.title,
					videoThumbnail: video.thumbnail,
					intoxicationLevel: 1,
					numberOfRules: filmFormats[3].value
				});
			} catch {
				setError('Failed to load data');
			} finally {
				setIsLoading(false);
			}
		})();
	}, [router, searchParams]);

	async function generateRules() {
		if (!gameSettings) return;
		setIsGeneratingRules(true);
		try {
			const response = await fetch('/api/games/generate-rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					videoId: gameSettings.videoId,
					videoTitle: gameSettings.videoTitle,
					numberOfRules,
					intoxicationLevel
				})
			});
			if (!response.ok) throw new Error('Failed');
			const data = await response.json();
			setRules(
				data.rules.map((rule: Rule, index: number) => ({
					...rule,
					id: `temp-${Date.now()}-${index}`,
					order: index + 1,
					isCustom: false
				}))
			);
		} catch {
			setError('Failed to generate rules');
		} finally {
			setIsGeneratingRules(false);
		}
	}

	async function rerollRules() {
		if (!gameSettings) return;
		setIsRerolling(true);
		try {
			const response = await fetch('/api/games/generate-rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					videoId: gameSettings.videoId,
					videoTitle: gameSettings.videoTitle,
					numberOfRules,
					intoxicationLevel
				})
			});
			if (!response.ok) throw new Error('Failed');
			const data = await response.json();
			setRules(
				data.rules.map((rule: Rule, index: number) => ({
					...rule,
					id: `temp-${Date.now()}-${index}`,
					order: index + 1,
					isCustom: false
				}))
			);
		} catch {
			setError('Failed to re-roll rules');
		} finally {
			setIsRerolling(false);
		}
	}

	async function rerollSingleRule(ruleIndex: number) {
		if (!gameSettings) return;
		const ruleId = rules[ruleIndex].id;
		setRerollingRules((s) => new Set(s).add(ruleId));
		try {
			const response = await fetch('/api/games/generate-rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					videoId: gameSettings.videoId,
					videoTitle: gameSettings.videoTitle,
					numberOfRules: 1,
					intoxicationLevel: gameSettings.intoxicationLevel
				})
			});
			if (!response.ok) throw new Error('Failed');
			const data = await response.json();
			const newRule = {
				...data.rules[0],
				id: `temp-${Date.now()}-${ruleIndex}`,
				order: ruleIndex + 1,
				isCustom: false
			};
			setRules((prev) => prev.map((r, i) => (i === ruleIndex ? newRule : r)));
		} catch {
			setError('Failed to re-roll rule');
		} finally {
			setRerollingRules((s) => {
				const next = new Set(s);
				next.delete(ruleId);
				return next;
			});
		}
	}

	function addCustomRule(e: React.FormEvent) {
		e.preventDefault();
		if (!customRuleText.trim()) return;
		const newRule: Rule = {
			id: `custom-${Date.now()}`,
			text: customRuleText.trim(),
			category: customRuleCategory,
			baseDrink: customRuleDrink,
			order: rules.length + 1,
			isCustom: true
		};
		setRules((prev) => [...prev, newRule]);
		setCustomRuleText('');
		setCustomRuleCategory(CategoryEnum.General);
		setCustomRuleDrink(DrinkEnum.Sip);
		setCustomModalOpen(false);
	}

	function deleteRule(ruleId: string) {
		setRules((prev) =>
			prev.filter((r) => r.id !== ruleId).map((r, i) => ({ ...r, order: i + 1 }))
		);
	}

	async function generateGame() {
		if (!gameSettings || rules.length === 0) return;
		setIsGenerating(true);
		try {
			const response = await fetch('/api/games', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: `${gameSettings.videoTitle} Drinking Game`,
					videoId: gameSettings.videoId,
					videoTitle: gameSettings.videoTitle,
					videoThumbnail: gameSettings.videoThumbnail,
					intoxicationLevel,
					rules: rules.map((rule) => ({
						text: rule.text,
						category: rule.category,
						baseDrink: rule.baseDrink,
						isCustom: rule.isCustom || false,
						ruleTemplateId: rule.ruleTemplateId
					}))
				})
			});
			if (!response.ok) throw new Error('Failed');
			const data = await response.json();
			router.push(`/game/${data.game.id}`);
		} catch {
			setError('Failed to generate game');
		} finally {
			setIsGenerating(false);
		}
	}

	function selectVideo(video: YoutubeVideo) {
		setGameSettings((g) =>
			g
				? {
						...g,
						videoId: video.id,
						videoTitle: video.title,
						videoThumbnail: video.thumbnail
					}
				: g
		);
		setVideoModalOpen(false);
	}

	if (isLoading) {
		return <LoadingSpinner label="Loading game setup..." />;
	}

	if (error && !gameSettings) {
		return <ErrorPanel title="Error" message={error} />;
	}

	if (!gameSettings) {
		return null;
	}

	return (
		<div className={`space-y-6 sm:space-y-10 ${rules.length > 0 ? 'pb-24 sm:pb-0' : ''}`}>
			<div className="text-center">
				<h1 className="text-2xl font-bold sm:text-3xl">🎬 Create Your Drinking Game</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Customize your settings and rules before generating your game
				</p>
			</div>

			<section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
				<h2 className="mb-4 text-xl font-semibold">Selected Video</h2>
				<div className="flex flex-col items-center gap-4 sm:flex-row">
					<ViewfinderFrame size="md" frameNumber="01">
						<img
							src={gameSettings.videoThumbnail || ''}
							alt={gameSettings.videoTitle}
							className="h-full w-full scale-[1.05] object-cover"
						/>
					</ViewfinderFrame>
					<div className="flex-1 text-center sm:text-left">
						<h3 className="font-medium">{gameSettings.videoTitle}</h3>
						<button
							type="button"
							onClick={() => setVideoModalOpen(true)}
							className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
						>
							Change Video
						</button>
					</div>
				</div>
			</section>

			<div className="grid gap-6 md:grid-cols-2">
				<section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-4 text-lg font-semibold">🍻 Intoxication Level</h3>
					<IsoTopPlate>
						<div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center">
							{isoValues.map((value, index) => (
								<button
									key={String(value)}
									type="button"
									onClick={() => setIsoIndex(index)}
									className={`min-h-11 w-full rounded-lg border-2 px-4 py-2 font-medium transition sm:min-w-[60px] sm:w-auto ${
										index === isoIndex
											? 'border-blue-600 bg-blue-600 text-white'
											: 'border-gray-200 bg-gray-100 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700'
									}`}
								>
									{value}
								</button>
							))}
						</div>
					</IsoTopPlate>
				</section>
				<section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
					<h3 className="mb-4 text-lg font-semibold">📸 Number of Rules</h3>
					<div className="flex flex-col gap-2">
						{filmFormats.map((format, index) => (
							<button
								key={format.label}
								type="button"
								onClick={() => setSelectedFormatIndex(index)}
								className={`flex items-center justify-between gap-2 rounded-lg border-2 px-4 py-2 transition ${
									index === selectedFormatIndex
										? 'border-blue-600 bg-blue-600 text-white'
										: 'border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700'
								}`}
							>
								<span className="flex items-center gap-2">
									<FormatAspectIcon aspect={format.aspect} />
									{format.label}
								</span>
								<span className="text-sm opacity-80">{format.value} rules</span>
							</button>
						))}
					</div>
				</section>
			</div>

			{rules.length === 0 ? (
				<div className="text-center">
					<button
						type="button"
						onClick={generateRules}
						disabled={isGeneratingRules}
						className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
					>
						{isGeneratingRules ? (
							<>
								<ShutterSpinner className="h-5 w-5" />
								Generating Rules...
							</>
						) : (
							'Generate Rules'
						)}
					</button>
				</div>
			) : (
				<section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
					<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
						<h2 className="text-xl font-semibold">📜 Your Rules</h2>
						<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
							<button
								type="button"
								onClick={rerollRules}
								disabled={isRerolling}
								className="min-h-11 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
							>
								{isRerolling ? (
									<span className="inline-flex items-center gap-2">
										<ShutterSpinner className="h-4 w-4" />
										Rerolling...
									</span>
								) : (
									'Reroll All'
								)}
							</button>
							<button
								type="button"
								onClick={() => setCustomModalOpen(true)}
								className="min-h-11 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto"
							>
								✨ Add Custom Rule
							</button>
						</div>
					</div>
					<div className="space-y-4">
						{rules.map((rule, index) => (
							<RuleCard
								key={rule.id}
								rule={rule}
								index={index}
								actions={
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => rerollSingleRule(index)}
											disabled={rerollingRules.has(rule.id)}
											className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-gray-200 hover:bg-blue-50 dark:border-gray-600"
											aria-label="Reroll rule"
										>
											{rerollingRules.has(rule.id) ? (
												<ShutterSpinner className="h-4 w-4" />
											) : (
												'↻'
											)}
										</button>
										<button
											type="button"
											onClick={() => deleteRule(rule.id)}
											className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 dark:border-gray-600"
											aria-label="Delete rule"
										>
											🗑️
										</button>
									</div>
								}
							/>
						))}
					</div>
					<div className="mt-8 hidden border-t border-gray-200 pt-8 text-center sm:block dark:border-gray-700">
						<button
							type="button"
							onClick={generateGame}
							disabled={isGenerating}
							className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
						>
							{isGenerating ? (
								<>
									<ShutterSpinner className="h-5 w-5" />
									Creating Game...
								</>
							) : (
								'Generate Game'
							)}
						</button>
						<p className="mt-2 text-sm text-gray-500">This will create your shareable drinking game!</p>
					</div>
				</section>
			)}

			{rules.length > 0 && (
				<GameSummaryStickyActions isGenerating={isGenerating} onGenerate={generateGame} />
			)}

			<Dialog.Root open={customModalOpen} onOpenChange={setCustomModalOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
					<Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85dvh] w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl dark:border-gray-700 dark:bg-gray-800">
						<Dialog.Title className="text-xl font-semibold">✨ Add a Custom Rule</Dialog.Title>
						<form onSubmit={addCustomRule} className="mt-4 space-y-4">
							<div>
								<label className="mb-1 block text-sm font-medium">Rule Description</label>
								<textarea
									value={customRuleText}
									onChange={(e) => setCustomRuleText(e.target.value)}
									rows={3}
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
									placeholder="e.g., Every time someone laughs, take a sip."
								/>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-1 block text-sm font-medium">Category</label>
									<select
										value={customRuleCategory}
										onChange={(e) => setCustomRuleCategory(e.target.value)}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
									>
										{Object.values(CategoryEnum).map((cat) => (
											<option key={cat} value={cat}>
												{cat.charAt(0).toUpperCase() + cat.slice(1)}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium">Drink</label>
									<select
										value={customRuleDrink}
										onChange={(e) => setCustomRuleDrink(Number(e.target.value))}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
									>
										{[DrinkEnum.Sip, DrinkEnum.Gulp, DrinkEnum.Pull, DrinkEnum.Shot].map((d) => (
											<option key={d} value={d}>
												{getDrinkName(d).name}
											</option>
										))}
									</select>
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<Dialog.Close asChild>
									<button
										type="button"
										className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
									>
										Cancel
									</button>
								</Dialog.Close>
								<button
									type="submit"
									className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
								>
									Add Rule
								</button>
							</div>
						</form>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>

			<Dialog.Root open={videoModalOpen} onOpenChange={setVideoModalOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
					<Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85dvh] w-[90%] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl dark:border-gray-700 dark:bg-gray-800">
						<Dialog.Title className="text-xl font-semibold">🎬 Choose a Different Video</Dialog.Title>
						<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
							{videos.slice(0, 12).map((video) => (
								<button
									key={video.id}
									type="button"
									onClick={() => selectVideo(video)}
									className={`overflow-hidden rounded-lg border-2 text-left transition hover:scale-[1.02] ${
										gameSettings.videoId === video.id
											? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
											: 'border-gray-200 dark:border-gray-600'
									}`}
								>
									<img
										src={getYoutubeThumbnailUrl(video.id)}
										alt=""
										loading="lazy"
										className="aspect-video h-[120px] w-full object-cover"
									/>
									<p className="p-2 text-sm font-medium line-clamp-2">{video.title}</p>
								</button>
							))}
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</div>
	);
}
