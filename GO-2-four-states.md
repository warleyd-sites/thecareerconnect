BATCH 2 OF 8: Four States (§5 of PRODUCTION_BAR.md)

Check AIDER_NOTES.md for progress from prior batches.

Work through PRODUCTION_BAR.md §5 (The Four States) only. Every async surface must have: loading skeleton (matching final layout), empty state (illustration + CTA), error state (names failure + recovery + retry), success state (visibly confirmed).

For each screen/component that loads data:
1. Check if all 4 states exist
2. Fix the missing ones — smallest change per iteration
3. Run test-cmd
4. Log to AIDER_NOTES.md with "BATCH 2 §5" prefix
5. /drop the file before moving to the next component

Also enforce: "No dead ends" — scrollable surfaces never just stop.

When all §5 items are green OR context is getting long, stop and summarize to AIDER_NOTES.md.
