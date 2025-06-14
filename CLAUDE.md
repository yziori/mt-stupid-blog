# CLAUDE.md
必ず日本語で回答してください
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production version
- `pnpm start` - Start production server

### Code Quality & Linting  
- `pnpm lint` - Run Next.js ESLint
- `pnpm biome:check` - Run Biome linter on src/
- `pnpm biome:format` - Format code with Biome (writes changes)
- `pnpm lint:html` - Run Markuplint on JSX/TSX files

### Storybook
- `pnpm sb` - Start Storybook dev server on port 6006
- `pnpm build-storybook` - Build Storybook for production

### Testing
- `vitest` - Run unit tests (includes both unit and Storybook tests)
- Tests are configured with workspaces: unit tests (*.test.ts/tsx) and Storybook tests

## Architecture

This is a Next.js 15 blog application built with TypeScript, using MicroCMS as the headless CMS.

### Project Structure
- Uses Next.js App Router with route groups: `(defaultRoot)/` for main pages
- **Container/UI Pattern**: Features use Container components for data fetching and UI components for presentation
- **Path Aliases**: `@components/*`, `@features/*`, `@libs/*`, `@utils/*` mapped to respective directories in `src/app/`

### Key Directories
- `src/app/_components/` - Reusable UI components with Storybook stories
- `src/app/_features/` - Feature-specific components following Container/UI pattern
- `src/app/_libs/` - External service integrations (MicroCMS client)
- `src/app/_utils/` - Utility functions

### MicroCMS Integration
- Client configured in `src/app/_libs/microcms/index.ts`
- Requires `MICROCMS_SERVICE_DOMAIN` and `MICROCMS_API_KEY` environment variables
- Types defined in `src/app/_libs/microcms/blogs/types.ts` and `src/app/_libs/microcms/tags/types.ts`

### Code Standards
- **Biome** for linting and formatting (tab indentation, double quotes)
- **Markuplint** for HTML/JSX validation
- **Lefthook** git hooks run biome check/format and markuplint on pre-commit
- **Storybook** for component documentation and testing

### Styling
- **Tailwind CSS** with custom configuration
- **Radix UI** for accessible components
- **shadcn/ui** component system (components.json configured)