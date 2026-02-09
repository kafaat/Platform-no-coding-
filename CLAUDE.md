# CLAUDE.md

This file provides guidance for AI assistants working with the **Platform-no-coding-** repository.

## Project Overview

**Platform-no-coding-** is a platform foundation project. It is currently in early-stage initialization with no application code, build system, or dependency configuration in place yet.

## Repository Structure

```
Platform-no-coding-/
├── CLAUDE.md          # AI assistant guidance (this file)
└── README.md          # Project description
```

The repository is minimal. As the project grows, update this section to reflect the directory layout.

## Current State

- **No build system** configured (no package.json, Makefile, Dockerfile, etc.)
- **No source code** files exist yet
- **No testing framework** is set up
- **No CI/CD pipeline** is configured
- **No linting or formatting** rules are defined
- **No .gitignore** is present

## Development Workflow

### Git

- **Default branch**: `main`
- **Remote**: origin
- Feature branches should follow the pattern `claude/<description>-<id>` or a similar convention

### Branching Strategy

1. Create a feature branch from `main`
2. Make changes and commit with clear, descriptive messages
3. Push to origin and open a pull request against `main`

## Conventions to Follow

### General

- Keep commits focused and atomic with descriptive messages
- Prefer editing existing files over creating new ones
- Avoid introducing unnecessary complexity or over-engineering
- Do not commit secrets, credentials, or environment-specific configuration

### When Adding New Technology

As the project grows, document the following in this file:
- Language and framework choices
- Package manager and dependency installation commands
- Build and run commands
- Test commands and conventions
- Linting and formatting commands
- Environment setup requirements

## Common Commands

_No commands configured yet. Update this section as the project adds tooling._

<!--
Example format for future use:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```
-->

## Architecture Notes

_No architecture defined yet. Update this section as the project takes shape._

## Troubleshooting

_No known issues yet. Document common problems and solutions here as they arise._
