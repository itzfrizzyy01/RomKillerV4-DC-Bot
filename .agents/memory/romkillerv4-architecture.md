---
name: RomKillerV4 architecture
description: Durable product direction for the Discord bot and owner dashboard.
---

The product should grow as independently enabled modules rather than a single all-purpose command handler. The owner dashboard is the control plane; Discord and Minecraft gateways are adapters behind stable API contracts.

**Why:** The requested feature set spans moderation, support, gameplay, economy, AI, media, and analytics. A modular boundary keeps deployments understandable and lets premium features evolve without coupling every command.

**How to apply:** New capabilities should add a focused module, persisted settings, an API contract, and a dashboard surface. Keep provider credentials in Replit Secrets or managed integrations.