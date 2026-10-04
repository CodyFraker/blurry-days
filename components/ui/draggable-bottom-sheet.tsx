'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MIN_HEIGHT_VH = 25;
const MAX_HEIGHT_VH = 50;
const DEFAULT_HEIGHT_VH = 35;
const DISMISS_BELOW_VH = 18;

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

type DraggableBottomSheetProps = React.ComponentProps<typeof SheetPrimitive.Root>;

function DraggableBottomSheet({ ...props }: DraggableBottomSheetProps) {
	return <SheetPrimitive.Root data-slot="draggable-bottom-sheet" {...props} />;
}

type DraggableBottomSheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> & {
	defaultHeightVh?: number;
	onRequestClose?: () => void;
};

function DraggableBottomSheetContent({
	className,
	children,
	defaultHeightVh = DEFAULT_HEIGHT_VH,
	onRequestClose,
	...props
}: DraggableBottomSheetContentProps) {
	const [heightVh, setHeightVh] = React.useState(defaultHeightVh);
	const [isDragging, setIsDragging] = React.useState(false);
	const dragRef = React.useRef<{ startY: number; startHeightVh: number } | null>(null);

	function clampHeight(height: number) {
		return Math.min(MAX_HEIGHT_VH, Math.max(MIN_HEIGHT_VH, height));
	}

	function finishDrag(clientY: number) {
		const drag = dragRef.current;
		dragRef.current = null;
		setIsDragging(false);
		if (!drag) {
			return;
		}
		const deltaY = clientY - drag.startY;
		const nextHeight = drag.startHeightVh - (deltaY / window.innerHeight) * 100;
		if (nextHeight < DISMISS_BELOW_VH) {
			onRequestClose?.();
			return;
		}
		setHeightVh(clampHeight(nextHeight));
	}

	function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
		e.preventDefault();
		dragRef.current = { startY: e.clientY, startHeightVh: heightVh };
		setIsDragging(true);
		e.currentTarget.setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
		if (!dragRef.current) {
			return;
		}
		const deltaY = e.clientY - dragRef.current.startY;
		const nextHeight = dragRef.current.startHeightVh - (deltaY / window.innerHeight) * 100;
		setHeightVh(Math.min(MAX_HEIGHT_VH + 2, Math.max(12, nextHeight)));
	}

	function onPointerEnd(e: React.PointerEvent<HTMLDivElement>) {
		if (!dragRef.current) {
			return;
		}
		e.currentTarget.releasePointerCapture(e.pointerId);
		finishDrag(e.clientY);
	}

	return (
		<SheetPrimitive.Portal>
			<SheetOverlay />
			<SheetPrimitive.Content
				data-slot="draggable-bottom-sheet-content"
				className={cn(
					'fixed inset-x-0 bottom-0 z-50 flex flex-col gap-0 rounded-t-xl border border-b-0 border-border bg-card pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg outline-none',
					!isDragging && 'transition-[height] duration-300 ease-out',
					className
				)}
				style={{ height: `${heightVh}dvh`, maxHeight: `${MAX_HEIGHT_VH}dvh` }}
				onOpenAutoFocus={(e) => e.preventDefault()}
				{...props}
			>
				<div
					className="flex shrink-0 cursor-grab touch-none justify-center py-2 active:cursor-grabbing"
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerEnd}
					onPointerCancel={onPointerEnd}
					role="separator"
					aria-orientation="horizontal"
					aria-label="Drag to resize sheet"
				>
					<div className="h-1.5 w-12 rounded-full bg-muted" />
				</div>
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
				<SheetPrimitive.Close
					className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
				>
					<X className="size-4" />
					<span className="sr-only">Close</span>
				</SheetPrimitive.Close>
			</SheetPrimitive.Content>
		</SheetPrimitive.Portal>
	);
}

export { DraggableBottomSheet, DraggableBottomSheetContent };
