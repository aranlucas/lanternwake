# Provenance

Vendored from https://github.com/dmmulroy/anti-slop at commit `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`, copied from `skills/install-anti-slop/assets/anti-slop/` into `tools/oxlint/anti-slop/`.

All production plugin sources are unchanged. The upstream MIT license and nested ESLint Stylistic license/provenance are preserved. Effect rules are not enabled because this project has no direct Effect dependency.

## Integration validation

Oxlint and @oxlint/plugins are both exactly 1.86.0. All 18 generic custom rules and the native accumulating-spread companion are enabled. On 2026-10-03, lint passed with zero diagnostics, TypeScript passed, and all 16 unit tests passed. A second spacing fix pass was byte-stable. The local build passed with an existing bundle-size warning. Binary art assets could not be fetched through the text-only connector, so full asset/E2E validation is delegated to the committed CI workflow on the complete checkout; it is not claimed locally.
