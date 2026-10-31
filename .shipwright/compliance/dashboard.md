# Compliance Dashboard

Generated: 2026-10-31T12:55:10.900230+00:00
Source-State: run=iterate-2026-10-31-envelope-window-address base=d5ce52b3f3ac release=v1.5.1
Consistency-audit: never run
Profile: generic
Scope: full_app

## ✅ Control Verdict

> **Controlled, minor gaps. Capped: verification incomplete — security not measured.**

### Control Grade: **B** (89/100) — Controlled, minor gaps.

| | Dimension | Signal | Anchor |
|---|-----------|--------|--------|
| ✅ | Requirement traceability | 12/12 FRs covered; 16/17 changes traced (FR-linked or classified no-FR) | requirement-to-work traceability (ISO/IEC/IEEE 29148) |
| ✅ | Test health | latest full suite 379/379 (2026-10-31) | automated tests pass (OpenSSF Scorecard) |
| ✅ | Change traceability | 16/17 changes linked to a commit, ADR or test run | change provenance (SLSA) |
| ✅ | Change reconciliation | 0/11 behavior-touched FRs not re-verified | re-verify changed requirements (ISO/IEC/IEEE 12207) |
| n/a | Security | no trustworthy local scan (see CI security gate) | no open high/critical vulns (NIST SSDF) |
| ✅ | Size / maintainability discipline | ratchet delta +0 lines (net growth) | no unchecked code-size growth (ISO/IEC 25010) |
| ✅ | Dependency hygiene | 0 unresolved / 46 licenses; 0 copyleft | dependency license & risk (OWASP) |

> 📊 **Test-Health · diff-coverage (Control-Grade input · target ≥80%):** not measured this session — per-PR signal; see the CI "Diff coverage" artifact.

Verified from: `shipwright_events.jsonl (17 events,  → 2026-10-31)`

_Grade = importance-weighted average over the measurable dimensions (n/a excluded from the denominator), modeled on OpenSSF Scorecard. Age is neutral; only unreconciled change and net growth are control failures. Each Anchor names the open standard the dimension follows — see the guide's Control-Grade dimensions table._

## 🛡️ CI Security (fail-closed gate)

_CI security results not yet ingested. Run `refresh_ci_security.py` (auto-run by `update_compliance.py`) to pull the latest `security.yml` scan._

## Quality Indicators

| Metric | Value | Status | Why warn? |
|--------|-------|--------|-----------|
| Pipeline phases completed | n/a (adopted) | INFO |  |
| Work events (iterate) | 16 changes | INFO |  |
| Recent changes traced to an FR | 15/16 (94%) | INFO | feature vs. maintenance mix — informational, does not affect the Control Grade |
| All unit tests passing | 379/379 | PASS |  |
| Architecture decisions | 18 ADRs | INFO |  |
| Iterate tests passing | 15/15 testable changes tested | PASS |  |
| Dependencies | 46 packages | INFO |  |
| Copyleft risk | 0 | PASS |  |
| Triage open | 148 open | WARN | 148 actionable item(s) — see ../agent_docs/triage_inbox.md |
| Bloat over-limit (grandfathered) | 0 | INFO |  |
| Bloat in allowlist | 0 entries | INFO |  |
| Bloat ratchet delta | +0 lines | PASS |  |

## Project Velocity

- Iterate: 16 changes (2026-10-21 → 2026-10-31)
- Last activity: 2026-10-31

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

