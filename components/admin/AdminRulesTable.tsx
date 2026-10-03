'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { CategoryIcon } from '@/lib/brand/categoryIcons';
import { categoryLabel } from '@/lib/rules/categoryDisplay';
import { getDrinkName } from '@/lib/rules/drinks';
import { cn } from '@/lib/utils';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RuleRatings } from '@/components/rules/RuleRatings';

export type AdminRuleRow = {
	id: string;
	text: string;
	category: string;
	weight: number;
	baseDrink: number;
	usageCount: number;
	enabled: boolean;
	description: string | null;
	thumbsUp: number;
	thumbsDown: number;
};

type AdminRulesTableProps = {
	rules: AdminRuleRow[];
	onEdit: (rule: AdminRuleRow) => void;
	onToggleEnabled: (rule: AdminRuleRow) => void;
	onDelete: (ruleId: string) => void;
	togglingId: string | null;
};

export function AdminRulesTable({
	rules,
	onEdit,
	onToggleEnabled,
	onDelete,
	togglingId
}: AdminRulesTableProps) {
	if (rules.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
				No rules match your filters.
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-card shadow-sm">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead>Rule</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Drink</TableHead>
						<TableHead className="text-right">Weight</TableHead>
						<TableHead className="text-center">Used</TableHead>
						<TableHead>Rating</TableHead>
						<TableHead className="text-center">Enabled</TableHead>
						<TableHead className="w-[5.5rem] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rules.map((rule) => {
						const drink = getDrinkName(rule.baseDrink);
						const saved = rule.description ?? '';

						return (
							<TableRow
								key={rule.id}
								className={cn('align-top', !rule.enabled && 'opacity-60')}
							>
								<TableCell className="max-w-md py-3">
									<button
										type="button"
										className="w-full space-y-1 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										onClick={() => onEdit(rule)}
									>
										<p className="font-medium leading-snug">{rule.text}</p>
										{!rule.enabled ? (
											<Badge variant="muted" className="text-[10px] uppercase tracking-wide">
												Disabled
											</Badge>
										) : null}
										{saved ? (
											<p className="line-clamp-1 text-xs text-muted-foreground">{saved}</p>
										) : null}
									</button>
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
								<TableCell className="py-3 text-center tabular-nums">{rule.usageCount}</TableCell>
								<TableCell className="py-3">
									<RuleRatings thumbsUp={rule.thumbsUp} thumbsDown={rule.thumbsDown} />
								</TableCell>
								<TableCell className="py-3">
									<div className="flex justify-center">
										<Switch
											checked={rule.enabled}
											disabled={togglingId === rule.id}
											onCheckedChange={() => onToggleEnabled(rule)}
											aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'}
										/>
									</div>
								</TableCell>
								<TableCell className="py-3 text-right">
									<div className="flex justify-end gap-0.5">
										<Button
											type="button"
											variant="ghost"
											size="icon"
											aria-label="Edit rule"
											onClick={() => onEdit(rule)}
										>
											<Pencil className="size-4" />
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="text-destructive hover:bg-destructive/10 hover:text-destructive"
													aria-label="Delete rule"
												>
													<Trash2 className="size-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete rule template?</AlertDialogTitle>
													<AlertDialogDescription>
														This permanently removes the rule from the catalog. Games that already
														include it are not affected.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														className="bg-destructive text-white hover:bg-destructive/90"
														onClick={() => onDelete(rule.id)}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
