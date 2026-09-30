BATCH 4 OF 8: Core Web Vitals (§4 of PRODUCTION_BAR.md)

Check AIDER_NOTES.md for progress from prior batches.

Work through PRODUCTION_BAR.md §4 (Performance) only. Focus on measurable items:
1. Code-split anything > 50KB not on critical path (React.lazy + Suspense)
2. Images: lazy-load below fold, add width/height or aspect-ratio, responsive srcset
3. Fonts: self-hosted or preloaded, font-display swap, ≤ 2 families
4. Lists > 20 items: add virtualization
5. No N+1 queries in data paths
6. Third-party scripts off critical path

For each fix:
- /add only the file being changed
- Make the fix
- Run test-cmd
- Log to AIDER_NOTES.md with "BATCH 4 §4" prefix
- /drop before moving on

When done or context is long, stop and summarize.
