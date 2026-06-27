# Task 7 Report: Ask Clara Lambda backend

**Status:** DONE

## Summary

Created `packages/ask-clara/` with the full Ask Clara request pipeline per spec §6–§8:

| File | Role |
|------|------|
| `handler.ts` | API Gateway v2 `POST /api/ask` entry — parses `{ message, history }`, runs gating flow, returns `{ answer, refused }` |
| `guardrails.ts` | `validateInput` (400 char max, HTML strip), `blocklistCheck`, `classifyTopic` (Bedrock YES/NO), `filterOutput` (AI phrasing + unknown URLs) |
| `retrieve.ts` | Keyword overlap scoring over bundled chunks; min score 1, top 5 |
| `budget.ts` | DynamoDB monthly partition `YYYY-MM`; `checkBudget`, `recordUsage`, `recordRefusedOverBudget`; Nova Lite/Haiku cost estimates; 80% CloudWatch warn |
| `prompts.ts` | System + classifier prompts, refusal/fallback copy from spec |
| `knowledge.json` | Copied from `src/content/knowledge.json` (28 chunks) |
| `types.ts`, `tsconfig.json` | Shared types and isolated typecheck for Lambda code |

**Flow:** rate-limit note (API Gateway, Task 8) → input validation → blocklist → budget check → classifier → retrieve → main Bedrock call → output filter → record usage → response.

**Root `package.json`:** added `@aws-sdk/client-bedrock-runtime`, `@aws-sdk/client-dynamodb`, `@types/aws-lambda`, `@types/node`.

**Verification:**
```
$ npx tsc --project packages/ask-clara/tsconfig.json --noEmit
(exit 0)

$ npm run build
GOOGLE_SHEET_ID unset — skipping sheet sync, using existing JSON
Generated src/content/knowledge.json (28 chunks)
✓ built in 940ms
(exit 0)
```

`sst.config.ts` not modified (Task 8).

## Concerns

- **`knowledge.json` drift** — copy is static until Task 8 adds a build/sync step to refresh `packages/ask-clara/knowledge.json` from `src/content/knowledge.json` on deploy.
- **No deployed smoke test** — Lambda/API/DynamoDB wiring deferred to Task 8; handler env expects `ASK_CLARA_USAGE_TABLE`, `BEDROCK_MODEL_ID`, `ASK_CLARA_MONTHLY_BUDGET_USD`, `AWS_REGION`.
- **Classifier parsing** — treats any response starting with `YES` as on-topic; may need tuning from CloudWatch logs (spec §12).
- **Cost estimates** — hard-coded per-model token prices; verify against current Bedrock pricing if spend tracking looks off.
- **Missing DynamoDB table** — `checkBudget` throws if table absent; handler catch returns Bedrock fallback (200) rather than a hard error — acceptable for demo but worth noting during Task 8 deploy.
- **Optional local test script** — not added (`scripts/test-ask-clara.mjs` was optional in plan).
