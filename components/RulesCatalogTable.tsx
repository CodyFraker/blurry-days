'use client';

import { Fragment, useState } from 'react';
import type { RuleTemplateListItem } from '@/lib/rules/ruleCatalog';
import { CategoryIcon } from '@/lib/brand/categoryIcons';
import { categoryLabel } from '@/lib/rules/categoryDisplay';
import { getDrinkName } from '@/lib/rules/drinks';
import { RuleRatings } from '@/components/rules/RuleRatings';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const columnCount = 7;

export function RulesCatalogTable({ rules }: { rules: RuleTemplateListItem[] }) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	function toggleExpanded(rule: RuleTemplateListItem) {
		if (!rule.description) {
			return;
		}
		setExpandedId((current) => (current === rule.id ? null : rule.id));
	}

	return (
		<div className="hidden rounded-xl border border-border bg-card shadow-sm md:block">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead>Rule</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Drink</TableHead>
						<TableHead className="text-right">Weight</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="text-center">Used in games</TableHead>
						<TableHead>Rating</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rules.map((rule) => {
						const drink = getDrinkName(rule.baseDrink);
						const hasDescription = Boolean(rule.description);
						const isExpanded = expandedId === rule.id;

						return (
							<Fragment key={rule.id}>
								<TableRow
									className={cn('align-top', hasDescription && 'cursor-pointer')}
									data-state={isExpanded ? 'selected' : undefined}
									onClick={() => toggleExpanded(rule)}
									onKeyDown={(e) => {
										if (!hasDescription) {
											return;
										}
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											toggleExpanded(rule);
										}
									}}
									tabIndex={hasDescription ? 0 : undefined}
									aria-expanded={hasDescription ? isExpanded : undefined}
								>
									<TableCell className="max-w-md py-3">
										<div className="space-y-1">
											<p className="font-medium leading-snug">{rule.text}</p>
											{hasDescription && !isExpanded ? (
												<p className="line-clamp-1 text-xs text-muted-foreground">
													{rule.description}
												</p>
											) : null}
										</div>
									</TableCell>
									<TableCell className="whitespace-nowrap py-3">
										<Badge variant="outline" className="gap-1.5 font-normal">
											<CategoryIcon category={rule.category} />
											{categoryLabel(rule.category)}
										</Badge>
									</TableCell>
									<TableCell className="whitespace-nowrap py-3">
										<span className="inline-flex items-center gap-1.5">
											<span aria-hidden>{drink.icon}</span>
											{drink.name}
										</span>
									</TableCell>
									<TableCell className="py-3 text-right tabular-nums">
										{rule.weight.toFixed(2)}
									</TableCell>
									<TableCell className="whitespace-nowrap py-3 text-muted-foreground">
										{rule.createdAt.toLocaleDateString()}
									</TableCell>
									<TableCell className="py-3 text-center tabular-nums">{rule.usageCount}</TableCell>
									<TableCell className="py-3">
										<RuleRatings
											thumbsUp={rule.thumbsUp}
											thumbsDown={rule.thumbsDown}
											ariaLabel="Ratings coming soon"
										/>
									</TableCell>
								</TableRow>
								{hasDescription && isExpanded ? (
									<TableRow className="bg-muted/30 hover:bg-muted/30">
										<TableCell colSpan={columnCount} className="px-4 py-4">
											<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
												Guidance
											</p>
											<p className="mt-1 whitespace-pre-wrap text-sm">{rule.description}</p>
										</TableCell>
									</TableRow>
								) : null}
							</Fragment>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
