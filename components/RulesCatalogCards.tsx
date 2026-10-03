'use client';

import { useState } from 'react';
import type { RuleTemplateListItem } from '@/lib/rules/ruleCatalog';
import { CategoryIcon } from '@/lib/brand/categoryIcons';
import { categoryLabel } from '@/lib/rules/categoryDisplay';
import { getDrinkName } from '@/lib/rules/drinks';
import { RuleRatings } from '@/components/rules/RuleRatings';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function RulesCatalogCards({ rules }: { rules: RuleTemplateListItem[] }) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	function toggleExpanded(rule: RuleTemplateListItem) {
		if (!rule.description) {
			return;
		}
		setExpandedId((current) => (current === rule.id ? null : rule.id));
	}

	return (
		<ul className="space-y-3 md:hidden">
			{rules.map((rule) => {
				const drink = getDrinkName(rule.baseDrink);
				const hasDescription = Boolean(rule.description);
				const isExpanded = expandedId === rule.id;

				return (
					<li key={rule.id}>
						<Card
							className={cn(hasDescription && 'cursor-pointer')}
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
							<CardContent className="space-y-3 p-4">
								<p className="font-medium leading-snug">{rule.text}</p>
								{hasDescription && isExpanded ? (
									<div className="rounded-md border border-border bg-muted/30 p-3">
										<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Guidance
										</p>
										<p className="mt-1 whitespace-pre-wrap text-sm">{rule.description}</p>
									</div>
								) : null}
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="outline" className="gap-1.5 font-normal">
										<CategoryIcon category={rule.category} />
										{categoryLabel(rule.category)}
									</Badge>
									<Badge variant="muted" className="gap-1 font-normal">
										<span aria-hidden>{drink.icon}</span>
										{drink.name}
									</Badge>
									<span className="text-sm text-muted-foreground">
										Used in {rule.usageCount} games
									</span>
								</div>
								<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
									<span>
										Weight {rule.weight.toFixed(2)} · {rule.createdAt.toLocaleDateString()}
									</span>
									<RuleRatings
										thumbsUp={rule.thumbsUp}
										thumbsDown={rule.thumbsDown}
										ariaLabel="Ratings coming soon"
									/>
								</div>
							</CardContent>
						</Card>
					</li>
				);
			})}
		</ul>
	);
}
