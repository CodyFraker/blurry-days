'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
	return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
	return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
	return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
	return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
	return (
		<SheetPrimitive.Overlay
			data-slot="draggable-bottom-sheet-overlay"
			className={cn('fixed inset-0 z-50 bg-black/50', className)}
			{...props}
		/>
	);
}

type SheetSide = 'top' | 'right' | 'bottom' | 'left';

function SheetContent({
	className,
	children,
	side = 'bottom',
	...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: SheetSide }) {
	return (
		<SheetPortal>
			<SheetOverlay />
			<SheetPrimitive.Content
				data-slot={side === 'bottom' ? 'draggable-bottom-sheet-content' : undefined}
				className={cn(
					'fixed z-50 flex flex-col gap-4 border border-border bg-card shadow-lg',
					side !== 'bottom' &&
						'transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
					side === 'bottom' &&
						'inset-x-0 bottom-0 max-h-[min(92dvh,900px)] rounded-t-xl border-b-0 pb-[max(1rem,env(safe-area-inset-bottom))]',
					side === 'top' && 'inset-x-0 top-0 max-h-[92dvh] rounded-b-xl border-t-0',
					side === 'left' && 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-l-0',
					side === 'right' && 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-r-0',
					className
				)}
				{...props}
			>
				{side === 'bottom' ? (
					<div
						className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-muted"
						aria-hidden
					/>
				) : null}
				{children}
				<SheetPrimitive.Close
					className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
				>
					<X className="size-4" />
					<span className="sr-only">Close</span>
				</SheetPrimitive.Close>
			</SheetPrimitive.Content>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('flex flex-col gap-1.5 px-4 pt-4 pr-12 text-center sm:text-left', className)}
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn(
				'mt-auto flex flex-col-reverse gap-2 border-t border-border px-4 py-4 sm:flex-row sm:justify-end',
				className
			)}
			{...props}
		/>
	);
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
	return (
		<SheetPrimitive.Title className={cn('text-lg font-semibold text-foreground', className)} {...props} />
	);
}

function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
	return (
		<SheetPrimitive.Description
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetPortal,
	SheetOverlay,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription
};
