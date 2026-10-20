# Compliance Dashboard

Generated: (no events)
Source-State: run=(unknown) base=49c0ddaa837e
Consistency-audit: never run
Profile: generic
Scope: full_app

## ❌ Control Verdict

> **Out of control — AI changes you can't verify. Primarily capped by requirement traceability.**

### Control Grade: **F** (25/100) — Out of control — AI changes you can't verify.

| | Dimension | Signal | Anchor |
|---|-----------|--------|--------|
| ⚠️ | Requirement traceability | 0/12 FRs covered; 0/1 changes traced (FR-linked or classified no-FR) | requirement-to-work traceability (ISO/IEC/IEEE 29148) |
| n/a | Test health | no full suite run recorded | automated tests pass (OpenSSF Scorecard) |
| ⚠️ | Change traceability | 0/1 changes linked to a commit, ADR or test run | change provenance (SLSA) |
| n/a | Change reconciliation | not measurable — needs per-change behavior-impact (BP-2) | re-verify changed requirements (ISO/IEC/IEEE 12207) |
| n/a | Security | no trustworthy local scan (see CI security gate) | no open high/critical vulns (NIST SSDF) |
| ✅ | Size / maintainability discipline | ratchet delta +0 lines (net growth) | no unchecked code-size growth (ISO/IEC 25010) |
| ⚠️ | Dependency hygiene | 7 unresolved / 41 licenses; 0 copyleft | dependency license & risk (OWASP) |

> 📊 **Test-Health · diff-coverage (Control-Grade input · target ≥80%):** not measured this session — per-PR signal; see the CI "Diff coverage" artifact.

Verified from: `shipwright_events.jsonl (1 events,  → )`

_Grade = importance-weighted average over the measurable dimensions (n/a excluded from the denominator), modeled on OpenSSF Scorecard. Age is neutral; only unreconciled change and net growth are control failures. Each Anchor names the open standard the dimension follows — see the guide's Control-Grade dimensions table._

## 🛡️ CI Security (fail-closed gate)

_CI security results not yet ingested. Run `refresh_ci_security.py` (auto-run by `update_compliance.py`) to pull the latest `security.yml` scan._

## Quality Indicators

| Metric | Value | Status | Why warn? |
|--------|-------|--------|-----------|
| Pipeline phases completed | n/a (adopted) | INFO |  |
| Work events (iterate) | 0 changes | INFO |  |
| Recent changes traced to an FR | n/a | n/a | no iterate changes recorded yet |
| All unit tests passing | 0/0 | WARN | no test events recorded yet |
| Architecture decisions | 2 ADRs | INFO |  |
| Dependencies | 41 packages | INFO |  |
| Copyleft risk | 0 | PASS |  |
| Triage open | 26 open | WARN | 26 actionable item(s) — see ../agent_docs/triage_inbox.md |
| Bloat over-limit (grandfathered) | 0 | INFO |  |
| Bloat in allowlist | 0 entries | INFO |  |
| Bloat ratchet delta | +0 lines | PASS |  |

## Project Velocity

- Last activity: 

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

