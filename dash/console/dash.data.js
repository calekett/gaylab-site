/*
 * dash.gaylab.me — control-plane content.
 * This is the file you edit. No build step: save, commit, push.
 *
 * IMPORTANT: this hub is meant to live behind Tailscale or Cloudflare Access
 * (see dash/README.md). The URLs below are private admin endpoints — they only
 * resolve/work from inside the tailnet. Keep this repo private OR keep this hub
 * off public Pages; if it must be public, scrub the hosts to MagicDNS names only.
 *
 * status: "online" | "offline" | "maintenance" | "planned"
 * gate:   "tailscale" | "cloudflare"           (shown as a pill)
 *
 * Links are built as:  <scheme>://<host>.<tailnet>:<port><path>
 * Scheme defaults to http, or https when port is 443 or you set scheme:"https"
 * (Proxmox on :8006 is https-only, for example). Set `url` for a literal link.
 * Leave host/url empty to show a "configure me" placeholder instead of a dead link.
 */
window.GAYLAB_DASH = {
  updated: "2026-07-15",

  // Your Tailscale MagicDNS suffix, e.g. "tail1a2b3c.ts.net". Used to build the
  // links below from each surface's `host`. Find it: `tailscale status` or the
  // admin console → DNS.
  tailnet: "tailnet.ts.net",

  // Cluster boot epoch — the uptime counter counts from this timestamp.
  uptimeSince: "2026-07-01T00:00:00Z",

  // ── Fleet-wide resource capacity (hand-set, not live) ─────────────────────
  resources: {
    cpu:     { used: 24, total: 80,  unit: "cores" },
    ram:     { used: 96, total: 320, unit: "GB" },
    storage: { used: 12, total: 48,  unit: "TB" },
    vms:     { used: 18, total: 40,  unit: "VMs" }
  },

  // ── Quick-action shortcuts ─────────────────────────────────────────────────
  actions: [
    { label: "restart velocity",  icon: "↻",  target: "panel",   desc: "bounce the MC proxy" },
    { label: "grafana",           icon: "📊", target: "grafana", desc: "open metrics dashboard" },
    { label: "pve cluster",       icon: "⊞",  target: "pve",    desc: "proxmox web UI" },
    { label: "maintenance on",    icon: "⚠",  target: null,      desc: "toggle site maint mode" },
    { label: "uptime kuma",       icon: "📡", target: "uptime",  desc: "check probe status" },
    { label: "truenas",           icon: "💾", target: "vault",   desc: "storage dashboard" }
  ],

  // ── Recent events / ops journal (newest first) ────────────────────────────
  journal: [
    { time: "2026-07-15 21:30", level: "ok",   msg: "velocity proxy restarted — config reload complete" },
    { time: "2026-07-15 18:00", level: "info", msg: "minigames world added to velocity routing table" },
    { time: "2026-07-14 22:15", level: "warn", msg: "terraria server entering maintenance — TShock update" },
    { time: "2026-07-14 12:00", level: "info", msg: "creative world backup completed — 2.4 GB snapshot" },
    { time: "2026-07-13 09:30", level: "ok",   msg: "pve-cluster quorum restored after node reboot" },
    { time: "2026-07-12 16:45", level: "info", msg: "grafana dashboard provisioning updated — 3 new panels" },
    { time: "2026-07-11 23:00", level: "warn", msg: "vault pool approaching 75% — consider expanding vdev" },
    { time: "2026-07-10 14:00", level: "ok",   msg: "OPNsense firewall rules reloaded — VLAN 30 console access confirmed" },
    { time: "2026-07-09 08:00", level: "info", msg: "plex library scan — 847 new items indexed" },
    { time: "2026-07-08 11:30", level: "ok",   msg: "full cluster reboot completed — all 10 nodes nominal" }
  ],

  // ── Network topology (rendered as ASCII art) ──────────────────────────────
  topology: {
    title: "VLAN topology",
    vlans: [
      { id: 1,  name: "mgmt",     cidr: "10.0.1.0/24",  desc: "management + Tailscale" },
      { id: 10, name: "compute",   cidr: "10.0.10.0/24", desc: "Proxmox cluster traffic" },
      { id: 20, name: "game",      cidr: "10.0.20.0/24", desc: "game servers (MC, Terraria, etc.)" },
      { id: 30, name: "console",   cidr: "10.0.30.0/24", desc: "retro consoles + streaming" },
      { id: 40, name: "media",     cidr: "10.0.40.0/24", desc: "Plex / Jellyfin / storage" },
      { id: 50, name: "iot",       cidr: "10.0.50.0/24", desc: "IoT + home automation" },
      { id: 99, name: "wan",       cidr: "—",            desc: "WAN uplink" }
    ]
  },

  // ── Control surfaces — the dashboards you actually open ────────────────────
  services: [
    // monitoring
    { name: "fleet health",   icon: "📡", category: "monitoring",
      host: "fleet",     port: 8088,  gate: "tailscale",  status: "planned",
      desc: "one-pane node status board (fleet-ui) — up/down, temps, quorum" },
    { name: "metrics",        icon: "📊", category: "monitoring",
      host: "grafana",   port: 3000,  gate: "tailscale",  status: "planned",
      desc: "Grafana + Prometheus — history, dashboards, alerting" },
    { name: "status",         icon: "🟢", category: "monitoring",
      host: "uptime",    port: 3001,  gate: "tailscale",  status: "planned",
      desc: "Uptime Kuma — external probes, notifications" },

    // game management
    { name: "game panel",     icon: "🎮", category: "game",
      host: "panel",     port: 443,   gate: "tailscale",  status: "planned",
      desc: "Pterodactyl — start/stop servers, consoles, users, backups" },

    // infrastructure
    { name: "virtualization", icon: "⊞",  category: "infra",
      host: "pve",       port: 8006,  scheme: "https", gate: "tailscale", status: "planned",
      desc: "Proxmox VE — the 10-node cluster: VMs, LXCs, migrations" },
    { name: "network",        icon: "🌐", category: "infra",
      host: "opnsense",  port: 443,   gate: "tailscale",  status: "planned",
      desc: "OPNsense — firewall, VLANs, port-forwards, DHCP/DNS" },

    // storage & media
    { name: "storage",        icon: "💾", category: "storage",
      host: "vault",     port: 443,   gate: "tailscale",  status: "planned",
      desc: "TrueNAS SCALE — pools, shares, snapshots, replication" },
    { name: "media",          icon: "🎬", category: "storage",
      host: "plex",      port: 32400, path: "/web", gate: "tailscale", status: "planned",
      desc: "Plex — library, transcode sessions, users" }
  ],

  // ── Physical fleet — the hardware behind it all ───────────────────────────
  nodes: [
    { name: "pve-cluster", count: 10, status: "planned",
      role: "Proxmox cluster", vlan: 10,
      spec: "10× Ryzen 7 5825U mini — game servers + aux services as VMs/LXCs",
      resources: { cpu: 80, ram: 320, storage: "2 TB NVMe each" },
      admin: { host: "pve", port: 8006, scheme: "https" } },
    { name: "pve-edge", status: "planned",
      role: "standalone Proxmox", vlan: 1,
      spec: "Intel i5-10500T — OPNsense (L3 router) VM + services LXC, off the cluster",
      resources: { cpu: 6, ram: 32, storage: "512 GB NVMe" },
      admin: { host: "pve-edge", port: 8006, scheme: "https" } },
    { name: "mon", status: "planned",
      role: "monitoring + QDevice", vlan: 1,
      spec: "Intel QuickSync box — Prometheus/Grafana + corosync quorum tiebreaker",
      resources: { cpu: 4, ram: 16, storage: "256 GB SSD" },
      admin: { host: "grafana", port: 3000 } },
    { name: "vault", status: "planned",
      role: "storage + media", vlan: 40,
      spec: "Ryzen 5 2600 + RTX 5060 Ti — TrueNAS SCALE (bare metal) + Plex app",
      resources: { cpu: 12, ram: 64, storage: "48 TB raidz2" },
      admin: { host: "vault", port: 443 } },
    { name: "consoles", status: "planned",
      role: "retro + streaming", vlan: 30,
      spec: "spare minis — NES→PS1 emulation + modern game streaming (VLAN 30)",
      resources: null,
      admin: null },
    { name: "sw-core", status: "planned",
      role: "L2 switch", vlan: 1,
      spec: "Aruba Instant On 1960 48G — VLAN trunking, 2× 10G uplinks to vault",
      resources: null,
      admin: { host: "sw-core", port: 443 } }
  ]
};
