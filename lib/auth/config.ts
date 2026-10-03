import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { accounts, sessions, users, verificationTokens } from '@/lib/db/schema';
import { readDiscordOAuthEnv } from '@/lib/auth/discordOAuthEnv';

const discordOAuth = readDiscordOAuthEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
	secret: process.env.AUTH_SECRET,
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens
	}),
	providers: [
		Discord({
			clientId: discordOAuth.clientId,
			clientSecret: discordOAuth.clientSecret
		})
	],
	session: {
		strategy: 'database'
	},
	trustHost: true,
	callbacks: {
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		}
	}
});
