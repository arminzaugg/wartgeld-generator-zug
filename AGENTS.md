# nidea-invoice

## WHAT
Wartgeld Generator Zug is a small single-page web app that lets midwives in the Canton of Zug (Switzerland) create the invoice for the cantonal midwife standby allowance ("Hebammenwartgeld"). The midwife enters the mother's name, home address and date of birth, ticks which of the two reimbursable services she provided (care during a home birth, care of the mother at home after birth; CHF 400 each), and the app produces a ready-to-send PDF invoice addressed to the municipal administration responsible for the mother's place of residence. The invoice can be previewed, printed or saved.

The midwife's own details (sender block with contact and IBAN, place of issue, an optional fixed invoice date, and a hand-drawn signature) are entered once on a settings page and reused for every invoice. These settings and all patient data stay in the user's browser; nothing about the patient is stored on a server. The only data that leaves the browser is the street text typed into the address field, which is sent to the Swiss Post address autocomplete service (via the project's own lookup service) and used to look up which municipality is responsible for a postcode.

The UI is German-only. The app is deployed as a static site on Netlify; its backend consists of a Supabase database holding the postcode-to-municipality mapping and the municipality addresses, and one Supabase edge function that proxies the Swiss Post autocomplete API with origin restriction and rate limiting.

## Stack
- **Runtime**: typescript
- **Frontend**: react, react-dom, vite
- **Backend**: —
- **Database**: @supabase/supabase-js
- **Auth**: —
- **Profile**: `generic`

## HOW

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Test
```bash
npm run test
```

## Ongoing Changes
This project was adopted into Shipwright on 2026-10-20. Prior code history is preserved.

**Use `/shipwright-iterate` for code changes — Do NOT edit code directly.**
The skill keeps specs, tests, ADRs, and the CHANGELOG in sync.

What `/shipwright-iterate` automates:
- ADR entry in `.shipwright/agent_docs/decision_log.md`
- CHANGELOG fragment under `CHANGELOG-unreleased.d/<category>/`
- Conventional Commits on an `iterate/<slug>` branch, merged to main on green tests
- FR / acceptance-criteria sync in `.shipwright/planning/`
- Compliance + dashboard refresh **in your working tree** (see below for what is committed)

Do NOT invoke `/shipwright-project`, `/shipwright-plan`, or `/shipwright-build` directly — those are pre-onboarding phases.

## How current is the audit evidence?

**Working tree:** current. **Committed on the default branch:** as of the last release or refresh, not continuously — each document's `Source-State:` line names the commit it was computed from. Iterate branches deliberately do not carry them (a branch derives them from its own history and is wrong for the default branch).

Refresh with `/shipwright-changelog` (a release checks them in) or `/shipwright-compliance --refresh-pr` (a documents-only PR in between). The moment you need current evidence is the moment to run it.


See `.shipwright/agent_docs/decision_log.md` for the adoption ADR (the topmost
`Adopt this repository into the Shipwright SDLC` entry — its id is the
next-free 3-digit number after any pre-existing ADRs).

## Review subagents: standing request. Workflows: ask every time.

**The review cascade is requested by default — spawn it, never pause to ask, and never record a review `not_run` citing a session policy.** That is `spec-reviewer` → `code-reviewer` → `doubt-reviewer` plus the review subagents other phase skills prescribe (build Step 6, campaign review). Codex withholds subagent spawning until the user asks; **this file is that request, and it stands for every session.** **The grant covers reviewers, not fan-out.** Dynamic workflows, deep-research, and parallel implementation subagents (build's `section-builder` loop) spend openly and stay the operator's call — ask explicitly, every time, and never infer them from the grant above. A project that does not want this can delete the section; it is deliberately plain and must not be compressed further, because it has to read as the user's request at runtime.


## Editing this file (keep it lean)

AGENTS.md is **orientation + a terse invariant index** — it is loaded into
every session, so every line here costs context on every future change.

- **New invariant / DO-NOT rule:** add **one line + a pointer** to the ADR or
  conventions entry that carries the rationale (e.g. `- Never bypass X — see
  ADR-012`). The full reasoning lives in
  `.shipwright/agent_docs/decision_log.md` or `conventions.md`, **not here**.
- **Exception — the standing-request section above** is deliberately one dense line: it must read as the user's request at runtime, and its length is what keeps this file under the hygiene cap. Leave it as it is. **No inline rationale:** if a rule needs more than ~2 lines to state, the
  extra lines belong in the ADR it cites. Keep lines short — a long paragraph
  on one line is still rationale.
- **Prefer updating an existing line** over adding a new one.
- **No automated growth gate for this file yet** — keep it lean by the
  same restraint CLAUDE.md's line-cap enforces; watch it by hand.

## Asking the user questions (plain language)

When you ask the user a question — a clarification, a choice between options,
or a confirmation — phrase it so a **non-senior developer or a normal user**
can understand, from a functional standpoint, what is actually being decided.
The person answering may not know the internals; do not make them decode
jargon to reply.

- **Lead with the functional meaning:** say what the choice changes about how
  the app behaves or what the user gets — not the implementation detail.
- **Avoid unexplained jargon.** If a technical term is unavoidable, add a short
  plain-language gloss in parentheses (e.g. "idempotent — safe to run twice
  without doubling the effect").
- **Make options concrete and comparable.** Give each option in plain words
  with its real-world trade-off ("Option A is simpler but slower; Option B is
  faster but adds a setup step"), not a raw technical menu.
- **Rule of thumb:** a product owner should be able to answer without asking
  "what does that mean?". If they couldn't, rewrite it.

This governs *phrasing only* — the rigor of the work is unchanged.


<!-- shipwright:codex-agents-md-appendix -->
## Codex operating policy

This project is managed by Shipwright (`/shipwright-iterate`). When Codex CLI
drives an iterate session, a `UserPromptSubmit` hook mints an activation
record on the session's first prompt if it matches the iterate skill's
envelope; a `PreToolUse` hook then denies any first tool call that isn't the
mandatory worktree-setup step, forcing an armed session through the correct
setup before anything else runs — Codex has no native skill/hook wiring of
its own, so Shipwright enforces this mechanically instead. Do not use
`xhigh` or `max` reasoning unless concrete risk, complexity, or a failed
review justifies it.

- Use one isolated worktree and branch per iterate; never push the default
  branch directly.
- Preserve unrelated and unexplained changes. Do not rewrite, discard, or
  absorb them silently.
- Reviews through the project's configured OpenRouter route are authorized.
- Do not commit mutable derived snapshots (e.g. a root
  `shipwright_test_results.json`). Preserve the required test ledger and
  surface evidence through the iterate skill's own contract.
- Delivery is complete only when `deliver_pr.py` reports `DELIVERED`.
