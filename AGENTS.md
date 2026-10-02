# Lanternwake

Original local-first puzzle toy. Never invoke an AI provider during gameplay,
connect live accounts, introduce analytics, or use copyrighted characters.
Keep game rules pure and deterministic in `src/game/simulation.ts`.
Phaser renders sprites; React owns accessible controls and menus.
Validate sequentially with `pnpm check`, `pnpm build`, `pnpm test:e2e`.
Use one Playwright worker. No deployment without explicit authorization.
