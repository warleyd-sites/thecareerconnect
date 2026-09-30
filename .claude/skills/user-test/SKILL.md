---
name: user-test
description: Persona-driven usability test of one user flow in this repo, in a real browser, against the live site (or local dev as fallback). Use when asked to "user test", "run usability testing", "test user flow X as <persona>", "UX regression", or "how would a first-time user experience this". Produces a P1/P2/P3 findings table in docs/USER_TESTING.md and fixes what it finds.
---
<!-- synced from portfolio-root/_portfolio/skills/user-test — edit there, then run _portfolio/scripts/sync-skills.sh -->

# /user-test — persona-driven usability testing

Invocation: `/user-test <flow> [as A|B|C|consumer|power|chaos]`. With no flow, test every flow listed in the repo config. With no persona, run the persona set for the repo's `type`.

Canonical source: `portfolio-root/_portfolio/skills/user-test/SKILL.md`. Per-repo copies are synced by `_portfolio/scripts/sync-skills.sh` — never edit a copy.

## 0. Read the repo config

Read the `## User testing (read by /user-test)` block in `./CLAUDE.md`. Fields:

| field | meaning |
|---|---|
| `type` | `PRODUCT` / `MARKETING_SITE` / `INTERNAL_TOOL` / `TEMPLATE` (READINESS_RUBRIC taxonomy) |
| `live` | production URL, or blank |
| `dev` | local URL and the command that starts it |
| `test account` | env var names for a throwaway account, or "(none yet …)" |
| `flows` | named critical paths, "step → step → step" |
| `persona notes` | one line of domain flavour per persona |

If the block is missing: stop, write one from README/STATUS (leave `live` blank if unknown), tell the owner, then continue.

## 1. Resolve the target

1. If `live` is set: `curl -sI -o /dev/null -w '%{http_code}' <live>`; on `200` (or 30x to same host) use it.
2. Otherwise use `dev`: check the port is answering; if not, start the command in the background and wait for it.
3. Print one line: `Target: <url> (live|dev fallback because <reason>)`. Every report header repeats it.

## 2. Resolve personas

| type | personas |
|---|---|
| PRODUCT | A, B, C |
| MARKETING_SITE | A, C |
| INTERNAL_TOOL | B, C |
| TEMPLATE | A, C |

An explicit `as <persona>` overrides the table.

## 3. Personas

**A — First-time consumer (low tech literacy).** Skims, never reads dense text, expects immediate feedback on every click. Clicks outside modals to close them, expects instant search, abandons any flow with >3 input steps that lacks inline guidance. Judges: CTA copy clarity, visual hierarchy, mobile responsiveness, self-evident errors.

**B — Power / business user (high efficiency).** Goal-oriented; wants bulk actions, keyboard shortcuts, fast filters, clear confirmation on destructive actions. Fills forms rapidly, tests edge filters, checks export/import, presses Back mid-flow and expects state to persist. Judges: data density, skeletons vs blocking spinners, autofill compatibility, undo/confirm.

**C — Chaos tester (edge cases).** Submits blank forms, 500+ character and unicode strings, double-clicks submit, navigates back mid-transaction, throttles the network. Judges: client-side validation, race conditions, debouncing, error boundaries.

Apply `persona notes` from the config so B means the right kind of business user for this product.

### Prod-safety rule (non-negotiable)

When the target is the **live** URL:
- No persona completes a write — signup, payment, post, upload, delete, message — unless `test account` names real env vars and the flow is run signed in as that account.
- Persona C probes validation up to the moment a submit would succeed, then backs out (clear the field / close the modal / navigate away). Double-click tests are done on buttons that would fail validation, never on a valid form.
- Stripe or any checkout: stop at the payment page. Never enter card details on live.
- A violation of this rule is logged as **P1 against the skill**, not the app, and reported to the owner.

On `dev`, all writes are allowed.

## 4. Protocol (five steps, in order)

Use Claude in Chrome (`claude --chrome`). Load the browser tools once with a single ToolSearch: `tabs_context_mcp, tabs_create_mcp, navigate, computer, read_page, find, read_console_messages, read_network_requests, resize_window, tabs_close_mcp`.

Tool quirks learned in the 2026-08-27 pilots — follow these or the run is silently wrong:
- **Trackers arm on first call.** Call `read_console_messages` and `read_network_requests` once, *then* navigate/reload; only after that do load-time errors appear.
- **`resize_window` reports success even when nothing changes** (a maximized/full-screen Chrome window will not shrink). Verify with a screenshot — the image width is the viewport. If it did not change, un-maximize the window and retry; if it still will not, run the 375px pass with the repo's Playwright mobile project (`--project=mobile-chrome` or the repo's equivalent) and say so in the report header. Never claim 375px coverage you did not get.
- **Screenshot immediately after every click.** Toasts and inline errors can expire before a delayed capture; a missing message is only a finding if the immediate screenshot is also empty.
- `read_page` may show an element's *placeholder* as its name even when a `<label for>` exists — confirm label association in source before logging it as a defect.

**Step 1 — Health & baseline.** Open the target in a new tab. Read console (errors + warnings) and network (4xx/5xx, failed assets) *before* interacting. Anything present here is a finding with location `/` regardless of flow.

**Step 2 — Persona walkthrough.** For each flow × persona × viewport (**375×812 and 1440×900**, via `resize_window`): walk the flow strictly in character. Screenshot at each decision point and every state change to `docs/user-testing/<YYYY-MM-DD>/<flow-slug>-<persona>-<viewport>-<n>.png`. At each click, note whether hover/active/loading feedback appeared immediately. After each step, re-read console + network for new errors. Chaos-specific: every text input gets a paste longer than its `maxLength` — silent truncation with no counter is a P3; a server limit stricter than the client's is a P2.

**Step 3 — Heuristic evaluation.** Score the flow against:
- *Visibility of system status* — async states (saving, uploading, fetching) visibly signalled?
- *Match to the real world* — user-facing words are the domain's words, not internal names (`tenant`, `org_id`, `RLS`)?
- *Error prevention & recovery* — error text says how to fix, not just what broke?
- *Accessibility* — every input has a visible label; interactive targets ≥ 44×44 px (use `read_page` bounding boxes, not eyeballing); tab order reaches every control; focus visible.

**Step 4 — Log findings.** Append a run section to `docs/USER_TESTING.md` (create from `_portfolio/templates/USER_TESTING.md` if missing):

```md
## 2026-08-27 — <flow> as <persona> @ <target> (375 + 1440)

| Severity | Location | Issue / friction | Persona impact | Fix | Status |
|---|---|---|---|---|---|
| P1 | /checkout | Submit has no loading state; double-click submits twice | Double charge | Disable on click, show spinner | ⏳ verify on prod |
```

Severities: **P1 blocker** (data loss, double-submit, dead end, crash, prod-safety) · **P2 UX flaw** (confusing, stale data, no feedback) · **P3 minor** (copy, spacing, late validation hints). Statuses: `✅ fixed <sha>` · `⏳ verify on prod` · `🔒 owner → OWNER_ACTIONS.md` · `⛔ needs test account`. Keep the `## Open` list at the top of the file current: add new open rows, remove closed ones.

**Step 5 — Self-heal & verify.** Fix every P1 and P2 now, in this session (global rule: fix what you find). Locate the component, patch without changing its contract, re-run the failing step on `dev`, then mark `⏳ verify on prod`; the next run on live clears it to `✅ fixed <sha>`. A fixed P1 gets a guard (unit test, e2e spec, or lint rule) and an entry in `docs/FAILURE_PATTERNS.md` when that file exists. P3s: fix if under five minutes, else log. Owner-gated items go to `OWNER_ACTIONS.md` with what is blocked, what unblocks it, who can do it.

## 5. Close out

Last line of the report, always:

`user-test <flow>: N findings — P1 x, P2 y, P3 z · fixed a · open b (docs/USER_TESTING.md ## Open) · owner c (OWNER_ACTIONS.md)`

## Failure handling

- Live unreachable → dev fallback, stated in the header.
- Dev won't start → one P1 row "cannot test: <error>", nothing else, stop.
- Flow needs a write and no `test account` → run to the write, log `⛔ needs test account`, add an OWNER_ACTIONS entry asking for `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`.
- Chrome extension not connected → tell the owner to run `claude --chrome`. Do not infer UX from source code.
- Shipping a fix: commit on a branch, `gh pr create --head <branch>` (pass `--head` explicitly — inference fails on fresh checkouts), merge, then mark the row `⏳ verify on prod`. Push with `--no-verify` only for docs-only changes when a pre-push hook runs the full suite; say so in the commit body.
