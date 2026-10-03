import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'standalone',
	serverExternalPackages: ['drizzle-orm', 'drizzle-zod', 'postgres', '@auth/drizzle-adapter']
};

export default nextConfig;
