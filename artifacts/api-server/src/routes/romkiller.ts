import { Router, type IRouter } from "express";
import {
  GetDashboardResponse,
  GetEconomySummaryResponse,
  GetMinecraftStatusResponse,
  GetSettingsResponse,
  ListActivityResponse,
  ListModerationCasesResponse,
  ListTicketsResponse,
  UpdateSettingsBody,
  UpdateSettingsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const settings = {
  prefix: "?",
  aiEnabled: true,
  automodEnabled: true,
  antiNukeEnabled: true,
  minecraftEnabled: true,
  ticketPanelChannel: "support",
};

type DiscordResponse = Record<string, any>;

const discordConfig = {
  token: process.env.DISCORD_BOT_TOKEN,
  guildId: process.env.DISCORD_GUILD_ID,
};

async function discordGet(path: string): Promise<{ body: DiscordResponse; latency: number }> {
  if (!discordConfig.token) throw new Error("DISCORD_BOT_TOKEN is not configured");
  const started = Date.now();
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${discordConfig.token}` },
    signal: AbortSignal.timeout(8000),
  });
  const body = await response.json() as DiscordResponse;
  if (!response.ok) throw new Error(`Discord API ${response.status}: ${body.message || "request failed"}`);
  return { body, latency: Date.now() - started };
}

function snowflakeDate(id: string) {
  return new Date(Number((BigInt(id) >> 22n) + 1420070400000n)).toISOString();
}

async function liveDiscord() {
  if (!discordConfig.token || !discordConfig.guildId) {
    return {
      bot: { status: "Not configured", latency: 0, version: "—" },
      guild: { name: "Discord connection required", members: 0, onlineMembers: 0 },
      modules: [
        { key: "discord", label: "Discord gateway", status: "Not configured", detail: "Add DISCORD_BOT_TOKEN and DISCORD_GUILD_ID" },
      ],
      metrics: { activeTickets: 0, moderationActions: 0, activeGiveaways: 0, commandsToday: 0 },
    };
  }

  try {
    const [{ body: me }, { body: guild, latency }] = await Promise.all([
      discordGet("/users/@me"),
      discordGet(`/guilds/${discordConfig.guildId}?with_counts=true`),
    ]);
    return {
      bot: { status: "Online", latency, version: me.username ? `@${me.username}` : "Discord bot" },
      guild: {
        name: guild.name || "Discord server",
        members: guild.approximate_member_count || 0,
        onlineMembers: guild.approximate_presence_count || 0,
      },
      modules: [
        { key: "discord", label: "Discord gateway", status: "Connected", detail: `Live REST response in ${latency}ms` },
        { key: "moderation", label: "Moderation audit", status: "Connected", detail: "Reading the Discord audit log" },
        { key: "minecraft", label: "Minecraft bridge", status: process.env.MC_SERVER_HOST ? "Configured" : "Not configured", detail: process.env.MC_SERVER_HOST ? "Public server status enabled" : "Add MC_SERVER_HOST to enable" },
      ],
      metrics: { activeTickets: 0, moderationActions: 0, activeGiveaways: 0, commandsToday: 0 },
    };
  } catch (error) {
    return {
      bot: { status: "Offline", latency: 0, version: "—" },
      guild: { name: "Discord unavailable", members: 0, onlineMembers: 0 },
      modules: [{ key: "discord", label: "Discord gateway", status: "Offline", detail: error instanceof Error ? error.message : "Discord request failed" }],
      metrics: { activeTickets: 0, moderationActions: 0, activeGiveaways: 0, commandsToday: 0 },
    };
  }
}

router.get("/dashboard", async (_req, res) => {
  res.json(GetDashboardResponse.parse(await liveDiscord()));
});

router.get("/settings", (_req, res) => res.json(GetSettingsResponse.parse(settings)));

router.patch("/settings", (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  Object.assign(settings, parsed.data);
  return res.json(UpdateSettingsResponse.parse(settings));
});

router.get("/moderation/cases", async (_req, res) => {
  if (!discordConfig.guildId || !discordConfig.token) return res.json(ListModerationCasesResponse.parse([]));
  try {
    const { body } = await discordGet(`/guilds/${discordConfig.guildId}/audit-logs?limit=25`);
    const users = new Map((body.users || []).map((user: DiscordResponse) => [user.id, user.username]));
    const rows = (body.audit_log_entries || [])
      .filter((entry: DiscordResponse) => ["MEMBER_BAN_ADD", "MEMBER_UPDATE", "MEMBER_KICK", "MESSAGE_DELETE"].includes(entry.action_type))
      .map((entry: DiscordResponse) => ({
        id: entry.id,
        action: entry.action_type,
        user: users.get(entry.target_id) || entry.target_id || "Unknown user",
        moderator: users.get(entry.user_id) || entry.user_id || "Unknown moderator",
        reason: entry.reason || "No reason supplied",
        createdAt: snowflakeDate(entry.id),
      }));
    return res.json(ListModerationCasesResponse.parse(rows));
  } catch {
    return res.json(ListModerationCasesResponse.parse([]));
  }
});
router.get("/tickets", (_req, res) => res.json(ListTicketsResponse.parse([])));

router.get("/minecraft/status", async (_req, res) => {
  const host = process.env.MC_SERVER_HOST;
  if (!host) return res.json(GetMinecraftStatusResponse.parse({
    online: false, players: 0, maxPlayers: 0, tps: 0, mspt: 0, ramUsed: 0, ramTotal: 0, cpu: 0,
    uptime: "Not configured", version: "—", world: "—",
  }));
  try {
    const response = await fetch(`https://api.mcsrvstat.us/3/${host}${process.env.MC_SERVER_PORT ? `:${process.env.MC_SERVER_PORT}` : ""}`, { signal: AbortSignal.timeout(8000) });
    const server = await response.json() as DiscordResponse;
    return res.json(GetMinecraftStatusResponse.parse({
      online: Boolean(server.online),
      players: server.players?.online || 0, maxPlayers: server.players?.max || 0, tps: 0, mspt: 0,
      ramUsed: 0, ramTotal: 0, cpu: 0, uptime: server.online ? "Live query" : "Offline",
      version: server.version || "—", world: server.motd?.clean?.[0] || host,
    }));
  } catch {
    return res.json(GetMinecraftStatusResponse.parse({
      online: false, players: 0, maxPlayers: 0, tps: 0, mspt: 0, ramUsed: 0, ramTotal: 0, cpu: 0,
      uptime: "Status query failed", version: "—", world: host,
    }));
  }
});

router.get("/economy/summary", (_req, res) => res.json(GetEconomySummaryResponse.parse({
  walletTotal: 0, bankTotal: 0, averageLevel: 0, dailyStreak: 0, topPlayers: [],
})));

router.get("/activity", async (_req, res) => {
  if (!discordConfig.guildId || !discordConfig.token) return res.json(ListActivityResponse.parse([]));
  try {
    const { body } = await discordGet(`/guilds/${discordConfig.guildId}/audit-logs?limit=25`);
    const rows = (body.audit_log_entries || []).map((entry: DiscordResponse) => ({
      id: entry.id,
      type: "discord",
      title: `Discord audit event: ${entry.action_type}`,
      detail: entry.reason || "No reason supplied",
      timestamp: snowflakeDate(entry.id),
    }));
    return res.json(ListActivityResponse.parse(rows));
  } catch {
    return res.json(ListActivityResponse.parse([]));
  }
});

export default router;