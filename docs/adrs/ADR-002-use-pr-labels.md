# ADR-002 — Use PR labels to drive version bumps

- **Status:** Accepted
- **Date:** 2026-06-04

## Context

Version bump type must be communicated from developer to automation. Options: commit message conventions (feat:, fix:), PR title conventions, PR labels.

## Decision

PR labels (`release:major`, `release:minor`, `release:patch`, `release:none`). Labels are explicit, visible in the GitHub UI, require deliberate intent, and are easy to audit. Conventional commit support deferred to v1.3.0.

## Consequences

- Users must create the four release labels in their repos
- No automatic inference from commit history
- Multiple-label conflicts fail loudly (configurable)
