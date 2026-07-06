/*
 * GAYLAB.ME — site content.
 * This is the ONE file you edit day-to-day. No build step: save, commit, push;
 * GitHub Pages redeploys in ~30s.
 *
 * status values:  "online" | "offline" | "maintenance" | "planned"
 * Bump `updated` whenever you flip a status so the page shows an honest date.
 */
window.GAYLAB_DATA = {
  updated: "2026-07-05",

  // Optional. Leave "" to hide the button/link.
  discord: "",                          // e.g. "https://discord.gg/xxxxxxx"
  admin: "/dash/",                      // fleet console launcher (real dashboards gated behind Tailscale)

  // ── Minecraft: one address, many worlds (Velocity routes players) ──────────
  minecraft: {
    address: "gaylab.me",               // players just type this (SRV record -> :25565)
    version: "1.21.x",
    worlds: [
      { name: "modded",    desc: "Forge / Fabric kitchen-sink pack", status: "planned" },
      { name: "survival",  desc: "vanilla+ Paper survival",          status: "planned" },
      { name: "minigames", desc: "parkour, bed wars, party games",   status: "planned" }
    ]
  },

  // ── Other game servers (each its own address:port) ─────────────────────────
  games: [
    { name: "terraria", address: "terraria.gaylab.me", port: 7777, desc: "tModLoader / tShock",       status: "planned" },
    { name: "valheim",  address: "valheim.gaylab.me",  port: 2456, desc: "dedicated viking survival", status: "planned" }
  ],

  // ── "tree ./gaylab" — public-safe blurbs. No IPs / hostnames here. ──────────
  lab: [
    { key: "game-servers", desc: "cluster of mini-PCs · one address · always-on" },
    { key: "consoles",     desc: "NES → PS1 classics + modern streaming, plug-and-play" },
    { key: "media",        desc: "private 4K library, streamed to every screen" }
  ]
};
