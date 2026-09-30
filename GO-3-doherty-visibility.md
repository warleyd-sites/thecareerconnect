BATCH 3 OF 8: Doherty Threshold + Visibility of System Status (§2 Doherty + §3 Visibility)

Check AIDER_NOTES.md for progress from prior batches.

Focus on two items only:
- §2 Doherty Threshold: every user input → visible response < 400ms. Add optimistic UI where round-trips are slow.
- §3 Nielsen "Visibility of system status": every async operation shows loading/empty/error/success.

These overlap with §5 (four states) which should already be done. This batch focuses on the SPEED of response — optimistic updates, instant feedback on taps/clicks, rollback on failure with toast.

For each interaction that waits for server:
1. Add optimistic update (setQueryData or equivalent)
2. Add rollback on error
3. Add toast on failure
4. Run test-cmd
5. Log to AIDER_NOTES.md with "BATCH 3 §2+§3" prefix
6. /drop files after each fix

When done or context is long, stop and summarize.
