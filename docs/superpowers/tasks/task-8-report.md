# Task 8 Report: SST infrastructure

**Status:** DONE

## Summary

Wired Ask Clara into SST: DynamoDB usage table, Lambda handler, HTTP API route, StaticSite build env, dev proxy, and knowledge copy in the build/deploy chain.

| Resource | Configuration |
|----------|---------------|
| `AskClaraUsage` | DynamoDB table, `pk` (string) hash key for monthly `YYYY-MM` partitions |
| `AskClara` | Lambda `packages/ask-clara/handler.handler`, Node.js 20, linked to usage table |
| Env vars | `ASK_CLARA_MONTHLY_BUDGET_USD=5`, `BEDROCK_MODEL_ID=amazon.nova-lite-v1:0`, `ASK_CLARA_USAGE_TABLE` |
| IAM | `bedrock:InvokeModel` on `*`; DynamoDB access via `link: [usage]` |
| `Api` | `POST /api/ask` → AskClara Lambda |
| CORS | POST/OPTIONS, `Content-Type`; origins: production domain + Vite dev/preview localhost |
| `Site` | StaticSite build passes `VITE_ASK_CLARA_API_URL: api.url` into Vite build |

**Supporting files**

| File | Change |
|------|--------|
| `sst.config.ts` | Full Ask Clara stack (table, function, API, StaticSite env) |
| `vite.config.ts` | Dev proxy `/api` → `VITE_ASK_CLARA_API_URL` or `http://localhost:13557` (sst dev) |
| `scripts/copy-knowledge.mjs` | Copies `src/content/knowledge.json` → `packages/ask-clara/knowledge.json` |
| `package.json` | `copy:knowledge` script; `build` and `deploy` run copy before bundle/deploy |

**Verification**

```
$ npm run build
GOOGLE_SHEET_ID unset — skipping sheet sync, using existing JSON
Generated src/content/knowledge.json (28 chunks)
Generated public/calendar/claras-day-dive.ics (3 events)
Generated sitemap.xml, robots.txt, llms.txt
Copied …/src/content/knowledge.json → …/packages/ask-clara/knowledge.json
✓ built in 665ms
(exit 0)
```

`npx sst deploy` was not run (no AWS credentials in this environment). Config follows SST v3 component patterns from the plan.

## Concerns

- **Deploy not smoke-tested** — Lambda bundle, API Gateway route, DynamoDB table, and Bedrock invoke need a credentialed `npm run deploy` or `npx sst deploy`.
- **CORS vs CloudFront URL** — Origins include `https://clarasdaydive.com` and localhost; the SST-assigned CloudFront URL is not in the allowlist until Task 11 sets `seo.siteUrl` and CORS is updated (or custom domain is wired).
- **Per-IP rate limit (10 req/min)** — Plan step 5 defers to API Gateway; HTTP API has no native per-IP throttle. Requires AWS WAF rate-based rule on the API stage or in-handler limiting (handler comment references Task 8). Not added in this task to avoid extra WAF cost/complexity without credentialed deploy validation.
- **Cross-origin in prod** — Frontend uses `VITE_ASK_CLARA_API_URL` (separate API host). CORS must match the deployed StaticSite origin; verify after first deploy.
- **Bedrock model access** — Account/region must have `amazon.nova-lite-v1:0` enabled in Bedrock before live Ask Clara works.
