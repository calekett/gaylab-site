/*
 * dash.gaylab.me — renders the control plane from dash.data.js. Vanilla JS.
 * Edit dash.data.js, not this file.
 */
(function () {
  "use strict";
  var D = window.GAYLAB_DASH || {};

  /* ── helpers ─────────────────────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var SLABEL = { online: "online", offline: "offline", maintenance: "maintenance", planned: "planned" };
  var SCLASS = { online: "g-online", offline: "g-offline", maintenance: "g-maint", planned: "g-planned" };
  function scls(s) { return SCLASS[s] || "g-planned"; }
  function glyph(s) { return '<span class="glyph ' + scls(s) + '" aria-hidden="true">' + (s === "planned" ? "○" : "●") + "</span>"; }
  function pill(txt, cls) { return '<span class="pill ' + (cls || "g-planned") + '">' + esc(txt) + "</span>"; }

  // Build a URL from {url} or {host,port,path} + tailnet. Returns "" if not set.
  function buildUrl(o) {
    if (!o) return "";
    if (o.url) return o.url;
    if (!o.host) return "";
    var host = o.host;
    if (host.indexOf(".") === -1 && D.tailnet) host = host + "." + D.tailnet;
    var scheme = (o.port === 443 || o.scheme === "https") ? "https" : "http";
    var port = o.port ? (":" + o.port) : "";
    if ((scheme === "https" && o.port === 443) || (scheme === "http" && o.port === 80)) port = "";
    return scheme + "://" + host + port + (o.path || "");
  }
  function launch(o, label) {
    var url = buildUrl(o);
    if (!url) return '<span class="launch off" title="set host/url in dash.data.js">not wired</span>';
    var u = esc(url);
    return '<a class="launch" href="' + u + '" target="_blank" rel="noopener noreferrer" ' +
      'title="' + u + '">' + esc(label || "open") + ' &rarr;</a>';
  }

  /* ── animated counting helper ───────────────────────────────────────────── */

  function animateCountUp(el, target, suffix, duration) {
    if (!el) return;
    var start = 0;
    var startTime = null;
    var isNumeric = typeof target === "number";
    if (!isNumeric) { el.textContent = target + (suffix || ""); return; }
    function frame(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / (duration || 900), 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current + (suffix || "");
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ── stats strip ────────────────────────────────────────────────────────── */

  var svc = D.services || [];
  var nodes = D.nodes || [];
  var nodeCount = nodes.reduce(function (a, n) { return a + (n.count || 1); }, 0);
  var online = svc.filter(function (s) { return s.status === "online"; }).length;

  var statsEl = document.getElementById("stats");
  if (statsEl) {
    var statItems = [
      { value: nodeCount, label: "nodes" },
      { value: svc.length, label: "surfaces" },
      { value: online + "/" + svc.length, label: "online" },
      { value: Object.keys(D.resources || {}).length > 0 ? (D.resources.vms ? D.resources.vms.used : "—") : "—", label: "VMs" },
      { value: esc(D.updated || "—"), label: "as of" }
    ];
    statsEl.innerHTML = statItems.map(function (s) {
      return '<div class="stat"><b class="stat-num" data-target="' + esc(String(s.value)) + '">0</b><span>' + s.label + "</span></div>";
    }).join("");

    // Animate the stat numbers on load
    var statNums = statsEl.querySelectorAll(".stat-num");
    statNums.forEach(function (el) {
      var t = el.getAttribute("data-target");
      var n = parseInt(t, 10);
      if (!isNaN(n) && String(n) === t) {
        animateCountUp(el, n, "", 1100);
      } else {
        el.textContent = t;
      }
    });
  }

  /* ── boot line ──────────────────────────────────────────────────────────── */

  var boot = document.getElementById("boot-text");
  var bootLine = document.getElementById("status-banner");
  if (boot) {
    if (online === 0) {
      boot.textContent = "control plane staged — surfaces come online as the fleet boots";
      if (bootLine) bootLine.classList.add("warn");
    } else {
      boot.textContent = online + " of " + svc.length + " surfaces up — systems nominal";
    }
  }

  /* ── uptime counter ─────────────────────────────────────────────────────── */

  (function uptimeClock() {
    if (!D.uptimeSince) return;
    var epoch = new Date(D.uptimeSince).getTime();
    if (isNaN(epoch)) return;
    var uptimeLine = document.getElementById("uptime-line");
    var uptimeVal = document.getElementById("uptime-value");
    if (!uptimeLine || !uptimeVal) return;
    uptimeLine.hidden = false;

    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function tick() {
      var diff = Date.now() - epoch;
      if (diff < 0) { uptimeVal.textContent = "not yet"; return; }
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400); s %= 86400;
      var h = Math.floor(s / 3600);  s %= 3600;
      var m = Math.floor(s / 60);    s %= 60;
      uptimeVal.textContent = d + "d " + pad(h) + "h " + pad(m) + "m " + pad(s) + "s";
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ── quick actions ──────────────────────────────────────────────────────── */

  var actionBar = document.getElementById("action-bar");
  if (actionBar && D.actions && D.actions.length) {
    actionBar.innerHTML = D.actions.map(function (a) {
      // If target matches a service host, build URL from that service
      var url = "";
      if (a.target) {
        var match = svc.filter(function (s) { return s.host === a.target; })[0];
        if (match) url = buildUrl(match);
      }
      var inner = '<span class="act-icon">' + (a.icon || "⚡") + '</span>' +
        '<span class="act-label">' + esc(a.label) + '</span>' +
        '<span class="act-desc">' + esc(a.desc || "") + '</span>';
      if (url) {
        return '<a class="action-chip" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(a.desc || a.label) + '">' + inner + '</a>';
      }
      return '<span class="action-chip action-chip--disabled" title="' + esc(a.desc || a.label) + '">' + inner + '</span>';
    }).join("");
  }

  /* ── resource gauges ────────────────────────────────────────────────────── */

  var gaugesEl = document.getElementById("gauges");
  if (gaugesEl && D.resources) {
    var res = D.resources;
    var keys = Object.keys(res);
    gaugesEl.innerHTML = keys.map(function (k) {
      var r = res[k];
      var pct = r.total > 0 ? Math.round((r.used / r.total) * 100) : 0;
      var color = pct > 85 ? "var(--red)" : pct > 60 ? "var(--amber)" : "var(--accent)";
      return '<div class="gauge-card">' +
        '<div class="gauge-head">' +
          '<span class="gauge-name">' + esc(k) + '</span>' +
          '<span class="gauge-pct">' + pct + '%</span>' +
        '</div>' +
        '<div class="gauge-track">' +
          '<div class="gauge-fill" style="width:' + pct + '%;background:' + color + '"></div>' +
        '</div>' +
        '<span class="gauge-sub">' + r.used + ' / ' + r.total + ' ' + esc(r.unit) + '</span>' +
      '</div>';
    }).join("");
  }

  /* ── control surfaces (grouped by category) ─────────────────────────────── */

  var CATEGORY_LABELS = {
    monitoring: "monitoring",
    game: "game management",
    infra: "infrastructure",
    storage: "storage & media"
  };
  var CATEGORY_ORDER = ["monitoring", "game", "infra", "storage"];

  var sEl = document.getElementById("services");
  if (sEl) {
    // Group services by category
    var grouped = {};
    svc.forEach(function (s) {
      var cat = s.category || "other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });

    var html = "";
    CATEGORY_ORDER.forEach(function (cat) {
      var items = grouped[cat];
      if (!items || !items.length) return;
      html += '<div class="cat-divider"><span class="cat-label">' + esc(CATEGORY_LABELS[cat] || cat) + '</span></div>';
      items.forEach(function (s) {
        var portBadge = s.port ? '<span class="port-badge">:' + s.port + '</span>' : '';
        html += '<div class="row wide row-glow">' + glyph(s.status) +
          '<div class="rc"><span class="rname">' +
            '<span class="svc-icon">' + (s.icon || "●") + '</span> ' +
            esc(s.name) + portBadge +
          '</span>' +
          '<span class="rdesc">' + esc(s.desc || "") + '</span></div>' +
          '<div class="rright">' + pill(s.gate || "gated", scls(s.status)) + launch(s) + '</div></div>';
      });
    });

    // Any uncategorized services
    var other = grouped.other;
    if (other && other.length) {
      html += '<div class="cat-divider"><span class="cat-label">other</span></div>';
      other.forEach(function (s) {
        html += '<div class="row wide row-glow">' + glyph(s.status) +
          '<div class="rc"><span class="rname">' + esc(s.name) + '</span>' +
          '<span class="rdesc">' + esc(s.desc || "") + '</span></div>' +
          '<div class="rright">' + pill(s.gate || "gated", scls(s.status)) + launch(s) + '</div></div>';
      });
    }

    sEl.innerHTML = html;
  }

  /* ── fleet nodes (cards with resource bars) ─────────────────────────────── */

  var ROLE_COLORS = {
    "Proxmox cluster": "var(--accent)",
    "standalone Proxmox": "var(--accent)",
    "monitoring + QDevice": "#4db5ff",
    "storage + media": "var(--amber)",
    "retro + streaming": "#b98cff",
    "L2 switch": "var(--red)"
  };

  var nEl = document.getElementById("nodes");
  if (nEl) {
    nEl.innerHTML = nodes.map(function (n) {
      var roleColor = ROLE_COLORS[n.role] || "var(--dim)";
      var badge = n.count ? pill("×" + n.count, "g-planned") : "";
      var vlanBadge = n.vlan != null ? '<span class="vlan-badge">VLAN ' + n.vlan + '</span>' : "";
      var link = n.admin ? launch(n.admin, "manage") : '<span class="launch off">—</span>';

      // Mini resource bars
      var resBars = "";
      if (n.resources) {
        var r = n.resources;
        if (typeof r.cpu === "number") {
          resBars += miniBar("cpu", r.cpu, 80);
        }
        if (typeof r.ram === "number") {
          resBars += miniBar("ram", r.ram + " GB", 0);
        }
        if (typeof r.storage === "string") {
          resBars += '<span class="node-res-line">storage: ' + esc(r.storage) + '</span>';
        }
      }
      var resBlock = resBars ? '<div class="node-res">' + resBars + '</div>' : '';

      return '<div class="node-card">' +
        '<div class="node-header">' +
          glyph(n.status) +
          '<div class="rc"><span class="rname">' + esc(n.name) +
            '<span class="role-badge" style="border-color:' + roleColor + ';color:' + roleColor + '">' + esc(n.role || "") + '</span>' +
          '</span>' +
          '<span class="rdesc">' + esc(n.spec || "") + '</span></div>' +
          '<div class="rright">' + vlanBadge + badge + link + '</div>' +
        '</div>' +
        resBlock +
      '</div>';
    }).join("");
  }

  function miniBar(label, value, max) {
    if (max > 0) {
      var pct = Math.round((value / max) * 100);
      return '<div class="node-res-line">' +
        '<span class="node-res-label">' + esc(label) + '</span>' +
        '<div class="mini-gauge-track"><div class="mini-gauge-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="node-res-val">' + value + '</span>' +
      '</div>';
    }
    return '<span class="node-res-line">' + esc(label) + ': ' + esc(value) + '</span>';
  }

  /* ── network topology ───────────────────────────────────────────────────── */

  var topoEl = document.getElementById("topo-map");
  if (topoEl && D.topology) {
    var t = D.topology;
    var vlans = t.vlans || [];

    // Build ASCII-style topology
    var topoHtml = '<div class="topo-title">' + esc(t.title || "network") + '</div>';

    // WAN connection at top
    topoHtml += '<div class="topo-row topo-wan">';
    topoHtml += '<span class="t-branch">    </span>';
    topoHtml += '<span class="topo-node topo-node--wan">☁ WAN</span>';
    topoHtml += '<span class="t-desc">  internet uplink</span>';
    topoHtml += '</div>';

    topoHtml += '<div class="topo-row"><span class="t-branch">    │</span></div>';
    topoHtml += '<div class="topo-row"><span class="t-branch">    ▼</span></div>';

    // OPNsense router
    topoHtml += '<div class="topo-row">';
    topoHtml += '<span class="t-branch">  </span>';
    topoHtml += '<span class="topo-node topo-node--router">⊞ opnsense (pve-edge)</span>';
    topoHtml += '<span class="t-desc">  L3 router · inter-VLAN firewall</span>';
    topoHtml += '</div>';

    topoHtml += '<div class="topo-row"><span class="t-branch">    │</span></div>';
    topoHtml += '<div class="topo-row"><span class="t-branch">    ▼</span></div>';

    // Core switch
    topoHtml += '<div class="topo-row">';
    topoHtml += '<span class="t-branch">  </span>';
    topoHtml += '<span class="topo-node topo-node--switch">◆ sw-core</span>';
    topoHtml += '<span class="t-desc">  Aruba 1960 48G · VLAN trunk · 2× 10G</span>';
    topoHtml += '</div>';

    topoHtml += '<div class="topo-row"><span class="t-branch">    │</span></div>';

    // VLAN table
    topoHtml += '<div class="topo-vlans">';
    vlans.forEach(function (v, i) {
      if (v.id === 99) return; // skip WAN
      var last = i === vlans.length - 1 || (i === vlans.length - 2 && vlans[vlans.length - 1].id === 99);
      var branch = last ? "└─" : "├─";
      var vlanColor = v.id === 1  ? "var(--dim)" :
                      v.id === 10 ? "var(--accent)" :
                      v.id === 20 ? "#4db5ff" :
                      v.id === 30 ? "#b98cff" :
                      v.id === 40 ? "var(--amber)" :
                      v.id === 50 ? "var(--red)" : "var(--dim)";
      topoHtml += '<div class="topo-row">' +
        '<span class="t-branch">    ' + branch + ' </span>' +
        '<span class="topo-vlan-id" style="color:' + vlanColor + '">VLAN ' + v.id + '</span>' +
        '<span class="topo-vlan-name" style="color:' + vlanColor + '">' + esc(v.name) + '</span>' +
        '<span class="t-desc">  ' + esc(v.cidr) + '  ' + esc(v.desc) + '</span>' +
      '</div>';
    });
    topoHtml += '</div>';

    topoEl.innerHTML = topoHtml;
  }

  /* ── ops journal ────────────────────────────────────────────────────────── */

  var LEVEL_CLASS = { ok: "j-ok", info: "j-info", warn: "j-warn", err: "j-err" };
  var LEVEL_ICON  = { ok: "✓", info: "·", warn: "⚠", err: "✗" };

  var journalEl = document.getElementById("journal-log");
  if (journalEl && D.journal && D.journal.length) {
    journalEl.innerHTML = D.journal.map(function (e) {
      var cls = LEVEL_CLASS[e.level] || "j-info";
      var icon = LEVEL_ICON[e.level] || "·";
      return '<div class="j-line ' + cls + '">' +
        '<span class="j-time">' + esc(e.time) + '</span>' +
        '<span class="j-icon">' + icon + '</span>' +
        '<span class="j-msg">' + esc(e.msg) + '</span>' +
      '</div>';
    }).join("");
  }

  /* ── footer ─────────────────────────────────────────────────────────────── */

  var segNodes = document.getElementById("seg-nodes");
  if (segNodes) segNodes.textContent = nodeCount + " nodes · " + svc.length + " surfaces";
  var segUpd = document.getElementById("seg-updated");
  if (segUpd) segUpd.textContent = "updated " + (D.updated || "—");
})();
