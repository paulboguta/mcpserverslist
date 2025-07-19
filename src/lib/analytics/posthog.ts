import { PostHog } from "posthog-node";
import { env } from "@/env";

export const posthogClient = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
	host: 'https://us.i.posthog.com',
});
