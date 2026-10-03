import { DrinkLegend } from '@/components/DrinkLegend';

export function RulesPageHeader() {
	return (
		<div className="relative overflow-hidden rounded-2xl px-4 py-8 sm:px-8">
			<div
				className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-700/40 via-slate-800/20 to-transparent dark:from-slate-600/30"
				aria-hidden
			/>
			<div
				className="pointer-events-none absolute inset-0 hidden bg-cover bg-center opacity-20 sm:block"
				style={{ backgroundImage: "url('/brand/hero.svg')" }}
				aria-hidden
			/>
			<div className="relative space-y-4">
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Rules catalog</h1>
				<p className="max-w-2xl text-gray-600 dark:text-gray-300">
					All drinking game rules used across Grainydays games. Ratings will be open for voting soon.
				</p>
				<DrinkLegend />
			</div>
		</div>
	);
}
