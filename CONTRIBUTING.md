# Contributing Guidelines

## Addon structure

The file outlines the structure of the addon's codebase:

- `src/Tool.tsx`: "Open in CodeSandbox" button implementation and Storybook parameters parsers.
- `src/manager.tsx`: addon configuration.
- `.storybook`: this directory holds development configuration for testing the addon.
    - `./preview.tsx`: example of an ideal global parameteres setup.
- `src/stories/Button.stories.ts`: example of an ideal story parameter setup.

## Commands

In order to test the addon, you should run two commands:

1. `pnpm run build`: to build the CodeSandbox addon (re-run on every change);
2. `pnpm run storybook`: to open the Storybook instance with the new addon (reload every change);

Or, just use `pnpm run start`

## Deployment

The GitHub Action (`.github/workflows/release.yml`) should automatically publish new versions to NPM. However, it's **necessary** to manually update the `package.json#version` number to bump the library version.