import { env } from "./src/env";
import posthog from "posthog-js";

posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: "/ll-analytics",
  ui_host: "https://us.posthog.com",
  // We only use posthog for LLM tracing, so we don't need to capture pageviews, exceptions, pageleaves, or performance
  capture_pageview: false,
  capture_exceptions: false,
  capture_pageleave: false,
  autocapture: false,
  capture_performance: false,
});
