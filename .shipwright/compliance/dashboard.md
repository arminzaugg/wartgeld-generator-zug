# Compliance Dashboard

Generated: 2026-11-08T09:00:55.369715+00:00
Source-State: run=iterate-2026-11-08-security-weekly-schedule base=2e3ba3d44d3c
Consistency-audit: never run
Profile: generic
Scope: full_app

## ✅ Control Verdict

> **Under full control. Primarily capped by change traceability.**

### Control Grade: **A** (98/100) — Under full control.

| | Dimension | Signal | Anchor |
|---|-----------|--------|--------|
| ✅ | Requirement traceability | 12/12 FRs covered; 19/20 changes traced (FR-linked or classified no-FR) | requirement-to-work traceability (ISO/IEC/IEEE 29148) |
| ✅ | Test health | latest full suite 392/392 (2026-11-08) | automated tests pass (OpenSSF Scorecard) |
| ✅ | Change traceability | 19/20 changes linked to a commit, ADR or test run | change provenance (SLSA) |
| ✅ | Change reconciliation | 0/11 behavior-touched FRs not re-verified | re-verify changed requirements (ISO/IEC/IEEE 12207) |
| ✅ | Security | 0 open high/critical | no open high/critical vulns (NIST SSDF) |
| ✅ | Size / maintainability discipline | ratchet delta +0 lines (net growth) | no unchecked code-size growth (ISO/IEC 25010) |
| ✅ | Dependency hygiene | 0 unresolved / 46 licenses; 0 copyleft | dependency license & risk (OWASP) |

> 📊 **Test-Health · diff-coverage (Control-Grade input · target ≥80%):** not measured this session — per-PR signal; see the CI "Diff coverage" artifact.

Verified from: `shipwright_events.jsonl (20 events,  → 2026-11-08)`

_Grade = importance-weighted average over the measurable dimensions (n/a excluded from the denominator), modeled on OpenSSF Scorecard. Age is neutral; only unreconciled change and net growth are control failures. Each Anchor names the open standard the dimension follows — see the guide's Control-Grade dimensions table._

## 🛡️ CI Security (fail-closed gate)

Latest scan: **2026-11-08** · source `security.yml#42465650762` · critical-gate **✅ PASS**

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |

Prompt-injection findings: **0**

**Accepted risks** (`shipwright_accepted_risks.yaml` register):

| ID | Target | Expires | Status | Recorded under |
|----|--------|---------|--------|----------------|
| CVE-2026-118764 | trivy-ignore | 2027-05-01 | ❌ UNRECORDED — no register entry | — |
| CVE-2026-118773 | trivy-ignore | 2027-05-01 | ❌ UNRECORDED — no register entry | — |
| CVE-2026-53666 | trivy-ignore | 2027-05-01 | ❌ UNRECORDED — no register entry | — |
| CVE-2026-53669 | trivy-ignore | 2027-05-01 | ❌ UNRECORDED — no register entry | — |

**Inline suppressions** (`# nosemgrep`, anti-ratchet baseline):

| Rule | Sites | Baseline | Recorded under |
|------|-------|----------|----------------|
| `javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp` | 2 | ❌ none | — |
| `javascript.lang.security.audit.unknown-value-with-script-tag.unknown-value-with-script-tag` | 2 | ❌ none | — |

_Inline suppressions are deliberately **not** tracked in the accepted-risk register: an offline reconciler would have to mirror the scanner's own suppression semantics and would drift, and a re-review date does not fit a permanent false positive at a fixed source site. The control is the anti-ratchet above — the count cannot grow without a recorded decision. This is visibility, **not** per-site review: unlike a register entry, no site here carries an owner or a re-review date._

_Ingested from CI `findings.json` (public-safe: severity counts + gate verdict only — no finding detail). The local `.shipwright/securityreports/` is intentionally **not** used (stale/FP-laden). Open high/critical feed the Control Grade's Security dimension._

## Quality Indicators

| Metric | Value | Status | Why warn? |
|--------|-------|--------|-----------|
| Pipeline phases completed | n/a (adopted) | INFO |  |
| Work events (iterate) | 19 changes | INFO |  |
| Recent changes traced to an FR | 16/19 (84%) | INFO | feature vs. maintenance mix — informational, does not affect the Control Grade |
| All unit tests passing | 392/392 | PASS |  |
| Architecture decisions | 18 ADRs | INFO |  |
| Iterate tests passing | 16/16 testable changes tested | PASS |  |
| Dependencies | 46 packages | INFO |  |
| Copyleft risk | 0 | PASS |  |
| Triage open | 163 open | WARN | 163 actionable item(s) — see ../agent_docs/triage_inbox.md |
| Bloat over-limit (grandfathered) | 0 | INFO |  |
| Bloat in allowlist | 0 entries | INFO |  |
| Bloat ratchet delta | +0 lines | PASS |  |

## Project Velocity

- Iterate: 19 changes (2026-10-21 → 2026-11-08)
- Last activity: 2026-11-08

## External LLM Review Evidence

| Split | Status | Provider | Findings | Self-review fallback | Reason |
|-------|--------|----------|----------|----------------------|--------|
| 01-adopted | missing | — | 0 | no | — |
| adr | missing | — | 0 | no | — |

## 🔎 Consistency Audit

**Never run — nothing has cross-checked this evidence against the project's actual state.**

_On demand by design: the audit has no schedule and no CI trigger, so it never runs on its own — invoke `/shipwright-compliance` to establish a first reading._

## Compliance Artifacts

| Document | Path | Description |
|----------|------|-------------|
| Event Log | [shipwright_events.jsonl](../../shipwright_events.jsonl) | Unified append-only event log |
| Traceability Matrix | [traceability-matrix.md](./traceability-matrix.md) | Requirements → Work Events → Tests |
| Test Evidence | [test-evidence.md](./test-evidence.md) | Test progression timeline |
| Commit Change Log | [change-history.md](./change-history.md) | Conventional Commits by type |
| Decision Log | [decision_log.md](../agent_docs/decision_log.md) | Architecture decisions (ADRs) |
| SBOM | [sbom.md](./sbom.md) | Open-source dependencies + licenses |
| Activity Dashboard | [build_dashboard.md](../agent_docs/build_dashboard.md) | Per-event change history + pipeline status |
| Changelog | [CHANGELOG.md](../../CHANGELOG.md) | Release notes |

