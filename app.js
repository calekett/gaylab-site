/*
 * gaylab.me — renders the page from data.js. Vanilla JS, no dependencies.
 * You normally don't touch this; edit data.js instead.
 */
(function () {
  "use strict";
  var D = window.GAYLAB_DATA || {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var SLABEL = { online: "online", offline: "offline", maintenance: "maintenance", planned: "coming soon" };
  var SCLASS = { online: "g-online", offline: "g-offline", maintenance: "g-maint", planned: "g-planned" };
  function scls(s) { return SCLASS[s] || "g-planned"; }
  function glyph(s) { return '<span class="glyph ' + scls(s) + '" aria-hidden="true">' + (s === "planned" ? "○" : "●") + "</span>"; }
  function pill(s) { return '<span class="pill ' + scls(s) + '">' + (SLABEL[s] || "coming soon") + "</span>"; }
  function addrChip(text) {
    var t = esc(text);
    return '<button class="addr" type="button" data-copy="' + t + '" aria-label="Copy ' + t + '">' +
      '<span class="br">[</span>' + t + '<span class="br">]</span><span class="ic" aria-hidden="true">⧉</span></button>';
  }
  function rc(name, desc) {
    return '<div class="rc"><span class="rname">' + esc(name) + '</span><span class="rdesc">' + esc(desc || "") + "</span></div>";
  }
  function row(name, desc, status, address) {
    return '<div class="row">' + glyph(status) + rc(name, desc) +
      '<div class="rright">' + pill(status) + (address ? addrChip(address) : "") + "</div></div>";
  }
  function allPlanned() {
    var items = [];
    if (D.minecraft && D.minecraft.worlds) items = items.concat(D.minecraft.worlds);
    if (D.games) items = items.concat(D.games);
    return items.length > 0 && items.every(function (x) { return (x.status || "planned") === "planned"; });
  }

  // boot line
  var boot = document.getElementById("boot-text");
  var bootLine = document.getElementById("status-banner");
  if (boot) {
    if (allPlanned()) {
      boot.textContent = "still booting — servers come online soon";
      if (bootLine) bootLine.classList.add("warn");
    } else {
      boot.textContent = "servers online heck yeah baby woo";
    }
  }

  // minecraft
  var mc = document.getElementById("minecraft");
  if (mc && D.minecraft && D.minecraft.address) {
    var m = D.minecraft;
    var worlds = (m.worlds || []).map(function (w) {
      return '<div class="mc-world">' + glyph(w.status) + rc(w.name, w.desc) +
        '<div class="rright">' + pill(w.status) + "</div></div>";
    }).join("");
    mc.innerHTML = '<div class="mc">' +
      '<div class="mc-top"><span class="mc-name">minecraft <small>java ' + esc(m.version || "") +
        " · one address, every world</small></span>" + addrChip(m.address) + "</div>" +
      '<div class="mc-worlds">' + worlds + "</div></div>";
  }

  // other games
  var games = document.getElementById("games");
  if (games && D.games) {
    games.innerHTML = D.games.map(function (g) {
      return row(g.name, g.desc, g.status, g.address + (g.port ? ":" + g.port : ""));
    }).join("");
  }

  // lab tree
  var tree = document.getElementById("lab-tree");
  if (tree && D.lab && D.lab.length) {
    var maxlen = D.lab.reduce(function (a, i) { return Math.max(a, (i.key || "").length); }, 0);
    var html = '<span class="t-row"><span class="t-name">gaylab/</span></span>';
    D.lab.forEach(function (it, idx) {
      var last = idx === D.lab.length - 1;
      var branch = last ? "└─ " : "├─ ";
      var gap = " ".repeat(Math.max(2, maxlen - (it.key || "").length + 3));
      html += '<span class="t-row"><span class="t-branch">' + branch + "</span>" +
        '<span class="t-name">' + esc(it.key) + "</span>" +
        '<span class="t-desc">' + gap + esc(it.desc || "") + "</span></span>";
    });
    tree.innerHTML = html;
  }

  // footer segments
  var count = (D.games ? D.games.length : 0) + (D.minecraft && D.minecraft.worlds ? D.minecraft.worlds.length : 0);
  var segCount = document.getElementById("seg-count");
  if (segCount) segCount.textContent = count + " game servers";
  var segUpd = document.getElementById("seg-updated");
  if (segUpd) segUpd.textContent = "updated " + (D.updated || "—");

  // discord
  if (D.discord) {
    var dl = document.getElementById("discord-link");
    if (dl) { dl.href = D.discord; dl.hidden = false; }
  }

  // admin (drop the whole segment if not set)
  var al = document.getElementById("admin-link");
  if (al) {
    if (D.admin) { al.href = D.admin; }
    else {
      var seg = al.closest ? al.closest(".seg") : null;
      if (seg && seg.parentNode) seg.parentNode.removeChild(seg);
    }
  }

  // copy-to-clipboard (delegated)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".addr") : null;
    if (!btn) return;
    var text = btn.getAttribute("data-copy") || "";
    copyText(text).then(function () { toast("copied " + text); });
  });
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (resolve) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "absolute"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(ta); resolve();
    });
  }
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1700);
  }

  // ── live status ────────────────────────────────────────────────────────────
  // Probe the Minecraft network (Velocity) via a public status API and reflect
  // the real up/down state on the page. No backend needed — runs in the browser.
  // Terraria/other games can't be pinged from a browser, so those keep their
  // hand-set data.js status (an honest "as of <updated>").
  (function probeMinecraft() {
    if (!D.minecraft || !D.minecraft.address) return;
    var url = "https://api.mcstatus.io/v2/status/java/" + encodeURIComponent(D.minecraft.address);
    fetch(url, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) {
        if (!s) return;
        var up = !!s.online;
        var pl = (s.players && typeof s.players.online === "number") ? s.players.online : 0;
        var max = (s.players && s.players.max) ? s.players.max : "";

        // intro boot line
        if (boot) {
          boot.textContent = up
            ? "servers online heck yeah woo | " + pl + " player" + (pl === 1 ? "" : "s") + " online"
            : "minecraft network offline — check back soon";
          if (bootLine) bootLine.classList.toggle("warn", !up);
        }

        // live pill next to the minecraft address
        var mcTop = document.querySelector("#minecraft .mc-top");
        if (mcTop && !mcTop.querySelector(".live-pill")) {
          var b = document.createElement("span");
          b.className = "pill live-pill " + (up ? "g-online" : "g-offline");
          b.textContent = up ? "online" + (max ? " · " + pl + "/" + max : "") : "offline";
          mcTop.appendChild(b);
        }

        // if the whole network is down, every world is effectively down
        if (!up) {
          document.querySelectorAll("#minecraft .mc-world").forEach(function (w) {
            var g = w.querySelector(".glyph"), p = w.querySelector(".pill");
            if (g) g.className = "glyph g-offline";
            if (p) { p.className = "pill g-offline"; p.textContent = "offline"; }
          });
        }
      })
      .catch(function () { /* network/API hiccup — keep the hand-set status */ });
  })();
})();
