/*
 * GAYLAB.ME — site content.
 * This is the ONE file you edit day-to-day. No build step: save, commit, push;
 * GitHub Pages redeploys in ~30s.
 *
 * status values:  "online" | "offline" | "maintenance" | "planned"
 * Bump `updated` whenever you flip a status so the page shows an honest date.
 * NOTE: the Minecraft network status is ALSO probed live on page load (see
 * app.js) via a public status API — that live result overrides the hand-set
 * value below, so players always see the real up/down state.
 */
window.GAYLAB_DATA = {
  updated: "2026-07-17",

  // Optional. Leave "" to hide the button/link.
  discord: "",                          // e.g. "https://discord.gg/xxxxxxx"
  admin: "/dash/",                      // fleet console launcher (real dashboards gated behind Tailscale)

  // ── Minecraft: one address, many worlds (Velocity routes players) ──────────
  minecraft: {
    address: "gaylab.me",               // players just type this (SRV record -> :25565)
    version: "26.2",
    worlds: [
      { name: "survival",  desc: "vanilla+ Paper survival. the main world", status: "online" },
      { name: "creative",  desc: "creative building",        status: "online" },
      { name: "modded",   desc: "WIP",         status: "online" },
      { name: "minigames", desc: "parkour & party games (building out)",     status: "online" }
    ]
  },

  // ── Terraria: vanilla + tModLoader, grouped like Minecraft ─────────────────
  terraria: {
    version: "1.4.5",
    variants: [
      { name: "vanilla",    address: "terraria.gaylab.me",   port: 7777, desc: "TShock 6.1 · open world", status: "online" },
      { name: "tmodloader", address: "tmodloader.gaylab.me", port: 7778, desc: "modded terraria",         status: "online" }
    ]
  },

  // ── Other game servers (each its own address:port) ─────────────────────────
  games: [
    { name: "valheim",           address: "valheim.gaylab.me", port: 2456, desc: "dedicated viking survival",   status: "online" },
    { name: "ark: evolved",      address: "ark.gaylab.me",     port: 7777, desc: "dino survival · TheIsland",    status: "online" },
    { name: "ark: ascended",     address: "ark-asa.gaylab.me", port: 7779, desc: "UE5 remaster · TheIsland",     status: "online" }
  ],

  // ── "tree ./gaylab" — public-safe blurbs. No IPs / hostnames here. ──────────
  lab: [
    { key: "game-servers", desc: "cluster" },
    { key: "consoles",     desc: "gaystations. yay" },
    { key: "media",        desc: "private media library. movies, shows, music" }
  ]
};
