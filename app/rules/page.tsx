import Link from 'next/link';
import { RulesCatalogCards } from '@/components/RulesCatalogCards';
import { RulesCatalogTable } from '@/components/RulesCatalogTable';
import { listRuleTemplates, parseListRulesQuery } from '@/lib/rules/ruleCatalog';

export default async function RulesPage({
	searchParams
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const params = await searchParams;
	const parsed = parseListRulesQuery({ page: params.page ?? '1' });

	if (!parsed.success) {
		return (
			<div className="py-8 text-center text-red-600 dark:text-red-400">
				Invalid page parameters.
			</div>
		);
	}

	const { rules, pagination } = await listRuleTemplates(parsed.data);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Rules catalog</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					All drinking game rules used across Grainydays games. Ratings will be open for voting
					soon.
				</p>
			</div>

			<RulesCatalogCards rules={rules} />
			<RulesCatalogTable rules={rules} />

			{pagination.totalPages > 1 && (
				<nav
					className="flex flex-wrap items-center justify-center gap-2"
					aria-label="Rules pagination"
				>
					{pagination.page > 1 && (
						<Link
							href={`/rules?page=${pagination.page - 1}`}
							className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
						>
							Previous
						</Link>
					)}
					<span className="px-2 text-sm text-gray-600 dark:text-gray-400">
						Page {pagination.page} of {pagination.totalPages}
					</span>
					{pagination.page < pagination.totalPages && (
						<Link
							href={`/rules?page=${pagination.page + 1}`}
							className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
						>
							Next
						</Link>
					)}
				</nav>
			)}
		</div>
	);
}
