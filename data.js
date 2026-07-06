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

  // Optional links. Leave "" to hide the button/link.
  discord: "",                          // e.g. "https://discord.gg/xxxxxxx"
  admin: "https://dash.gaylab.me",      // gated elsewhere (Tailscale / Cloudflare Access)

  // ── Minecraft: one address, many worlds (Velocity routes players) ──────────
  minecraft: {
    address: "gaylab.me",               // players just type this (SRV record -> :25565)
    version: "1.21.x",
    worlds: [
      { name: "Modded",    desc: "Forge / Fabric kitchen-sink pack", status: "planned" },
      { name: "Survival",  desc: "Vanilla+ Paper survival",          status: "planned" },
      { name: "Minigames", desc: "Parkour, bed wars, party games",   status: "planned" }
    ]
  },

  // ── Other game servers (each its own address:port) ─────────────────────────
  games: [
    { name: "Terraria", address: "terraria.gaylab.me", port: 7777, desc: "tModLoader / tShock",         status: "planned" },
    { name: "Valheim",  address: "valheim.gaylab.me",  port: 2456, desc: "Dedicated Viking survival",   status: "planned" }
  ],

  // ── "Inside the lab" — public-safe blurbs. No IPs / hostnames here. ─────────
  lab: [
    { icon: "🕹️", title: "Game servers",       desc: "A cluster of mini-PCs hosting Minecraft, Terraria, Valheim and more — one address, always-on." },
    { icon: "🌈",       title: "GayStation consoles", desc: "Custom retro consoles: thousands of classics from NES to PS1, plus modern streaming, on a pick-up-and-play cabinet." },
    { icon: "🎬",       title: "Media",               desc: "A private streaming library with hardware-transcoded 4K, served to every screen in the house." }
  ]
};
