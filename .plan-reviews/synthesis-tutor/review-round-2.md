# Plan Self-Review Round 2: Risk + Scope Creep

## Fixes Applied

### Must-Fix (from risk)
1. **iPad pointer event spike** — added 30-min throwaway test to Day 1, step 4. Retires #1 technical risk early. Includes fallback plan (tap-to-select if drag fails).
2. **Comparison zone for assessment problem 3** — simplified to two separate answer zones, each checked independently.
3. **Day 5 overload** — prod deploy already moved to Day 4 evening (from round 1). Day 5 is now polish + video only.

### Must-Fix (from scope creep, adopted as simplifications)
4. **Simplified FractionBlock model** — removed `groupId` and group system. Combine replaces two 1/4 blocks with one 2/4 block directly. Simpler data model, fewer components.
5. **Simplified tap-to-split** — removed radial menu. Only one valid split exists (1/2→1/4), so tapping a 1/2 block splits immediately. No menu UI needed.
6. **Removed SVG coordinate conversion as standalone task** — it's a 3-line inline helper, not a module.

### Should-Fix (from risk)
7. **Added Risk Mitigations table** to the design doc with the top 4 risks and their mitigations.
8. **Firebase SPA rewrite rule** — added explicit mention in Day 1 Firebase setup.

### Scope Creep Items Considered But Not Applied
- CSP headers: kept because they're 5 minutes of config and protect the demo from basic issues.
- Staging environment: kept because overseer explicitly requested prod + staging.
- `workspace.ts` module: simplified to use SVG native events for hit detection instead of manual coordinate math.
- `lessonScript.test.ts`: kept but understood as lightweight structural validation, not exhaustive.
