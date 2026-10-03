import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { RulesPageHeader } from '@/components/RulesPageHeader';
import { cn } from '@/lib/utils';
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
			<RulesPageHeader />

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
							className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-11')}
						>
							Previous
						</Link>
					)}
					<span className="px-2 text-sm text-muted-foreground">
						Page {pagination.page} of {pagination.totalPages}
					</span>
					{pagination.page < pagination.totalPages && (
						<Link
							href={`/rules?page=${pagination.page + 1}`}
							className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-11')}
						>
							Next
						</Link>
					)}
				</nav>
			)}
		</div>
	);
}
