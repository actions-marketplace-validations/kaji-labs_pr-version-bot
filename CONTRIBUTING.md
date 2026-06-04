# Contributing

## Prerequisites

- Node.js 20+
- npm 10+

## Local setup

```bash
npm ci
```

## Running tests

```bash
npm test
npm run test:coverage
```

## Building

```bash
npm run build
# dist/index.js is the compiled output — commit it alongside src/ changes
```

## Linting and formatting

```bash
npm run lint
npm run format
```

## Commit standards

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance
- `docs:` documentation only
- `test:` test changes

## Release process

Releases are automated. Add a `release:major`, `release:minor`, or `release:patch` label to your PR before merging.

## AI-assisted development

AI tools may be used for ideation, refactoring, test generation, and documentation support.
All contributors are responsible for reviewing, testing, and understanding any AI-assisted changes before opening a pull request.
Do not submit code that you cannot explain, maintain, or verify.
