# ADR-001 — Use semver for versioning

- **Status:** Accepted
- **Date:** 2026-06-04

## Context

Need a versioning scheme that is widely understood, supported by tooling, and works for both the action itself and consuming repos.

## Decision

Semantic Versioning 2.0.0. Version stored as a bare string in `VERSION.md`. The `semver` npm package handles all parsing and incrementing.

## Consequences

- Version is always a string — never parsed as a float
- Consumers must maintain a `VERSION.md` file with a valid semver
- The `semver` package is a production dependency
