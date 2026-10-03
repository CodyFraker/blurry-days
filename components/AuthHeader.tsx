'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

function userInitials(name: string | null | undefined): string {
	if (!name?.trim()) {
		return '?';
	}
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) {
		return parts[0].slice(0, 2).toUpperCase();
	}
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type AuthHeaderProps = {
	children?: React.ReactNode;
};

export function AuthHeader({ children }: AuthHeaderProps) {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return <div className="h-11 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />;
	}

	if (!session?.user) {
		return (
			<button
				type="button"
				onClick={() => signIn('discord')}
				className="min-h-11 whitespace-nowrap rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:px-4"
			>
				Sign in with Discord
			</button>
		);
	}

	const displayName = session.user.name ?? 'Account';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-11 w-11 rounded-full"
					aria-label="Account menu"
				>
					<Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-600">
						{session.user.image ? (
							<AvatarImage src={session.user.image} alt="" />
						) : null}
						<AvatarFallback className="text-xs">{userInitials(session.user.name)}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuLabel className="font-normal">
					<p className="truncate text-sm font-medium">{displayName}</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/my-games">My games</Link>
				</DropdownMenuItem>
				{children}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={(event) => {
						event.preventDefault();
						signOut();
					}}
				>
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
