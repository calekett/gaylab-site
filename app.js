/*
 * gaylab.me — renders the page from data.js. Vanilla JS, no dependencies.
 * You normally don't need to touch this; edit data.js instead.
 */
(function () {
  "use strict";
  var D = window.GAYLAB_DATA || {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var STATUS = {
    online:      { label: "Online",      cls: "s-online" },
    offline:     { label: "Offline",     cls: "s-offline" },
    maintenance: { label: "Maintenance", cls: "s-maint" },
    planned:     { label: "Coming soon", cls: "s-planned" }
  };
  function pill(status) {
    var s = STATUS[status] || STATUS.planned;
    return '<span class="pill ' + s.cls + '"><span class="dot"></span>' + s.label + "</span>";
  }
  function addrChip(text) {
    var t = esc(text);
    return '<button class="addr" type="button" data-copy="' + t + '" aria-label="Copy ' + t + '">' +
             '<span class="addr-txt">' + t + '</span><span class="addr-ic" aria-hidden="true">&#9106;</span>' +
           "</button>";
  }
  function allPlanned() {
    var items = [];
    if (D.minecraft && D.minecraft.worlds) items = items.concat(D.minecraft.worlds);
    if (D.games) items = items.concat(D.games);
    return items.length > 0 && items.every(function (x) { return (x.status || "planned") === "planned"; });
  }

  // updated date
  var upd = document.getElementById("updated");
  if (upd) {
    upd.textContent = D.updated || "—";
    if (D.updated) upd.setAttribute("datetime", D.updated);
  }

  // honest pre-launch banner (shows only while everything is still "planned")
  var banner = document.getElementById("status-banner");
  if (banner && allPlanned()) {
    banner.textContent = "🚧 Launching soon — the lab is still being built";
    banner.hidden = false;
  }

  // minecraft feature card
  var mc = document.getElementById("minecraft");
  if (mc && D.minecraft && D.minecraft.address) {
    var m = D.minecraft;
    var worlds = (m.worlds || []).map(function (w) {
      return "<li><span class=\"w-name\">" + esc(w.name) + "</span>" +
             "<span class=\"w-desc\">" + esc(w.desc || "") + "</span>" +
             pill(w.status) + "</li>";
    }).join("");
    mc.innerHTML =
      '<div class="mc-card">' +
        '<div class="mc-head">' +
          "<div><h3>Minecraft</h3><p class=\"muted\">Java Edition " + esc(m.version || "") + " · one address, every world</p></div>" +
          '<div class="mc-addr">' + addrChip(m.address) + "</div>" +
        "</div>" +
        '<ul class="mc-worlds">' + worlds + "</ul>" +
      "</div>";
  }

  // other games
  var games = document.getElementById("games");
  if (games && D.games) {
    games.innerHTML = D.games.map(function (g) {
      var full = g.address + (g.port ? ":" + g.port : "");
      return '<div class="card game">' +
               '<div class="card-top"><h3>' + esc(g.name) + "</h3>" + pill(g.status) + "</div>" +
               '<p class="muted">' + esc(g.desc || "") + "</p>" +
               '<div class="card-addr">' + addrChip(full) + "</div>" +
             "</div>";
    }).join("");
  }

  // lab cards
  var lab = document.getElementById("lab-cards");
  if (lab && D.lab) {
    lab.innerHTML = D.lab.map(function (c) {
      return '<div class="card lab-card">' +
               '<div class="lab-ic" aria-hidden="true">' + esc(c.icon || "✨") + "</div>" +
               "<h3>" + esc(c.title) + "</h3>" +
               '<p class="muted">' + esc(c.desc || "") + "</p>" +
             "</div>";
    }).join("");
  }

  // discord
  if (D.discord) {
    var dc = document.getElementById("discord-card");
    var dl = document.getElementById("discord-link");
    if (dc && dl) { dl.href = D.discord; dc.hidden = false; }
  }

  // admin link (remove it entirely if not configured)
  var al = document.getElementById("admin-link");
  if (al) {
    if (D.admin) al.href = D.admin;
    else if (al.parentNode) al.parentNode.removeChild(al);
  }

  // copy-to-clipboard (event delegation)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".addr") : null;
    if (!btn) return;
    var text = btn.getAttribute("data-copy") || "";
    copyText(text).then(function () { toast("Copied " + text); });
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
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  /* ── Optional: live status ─────────────────────────────────────────────────
   * Statuses above come from data.js (edited by hand). To auto-update them,
   * publish a small JSON — e.g. {"Terraria":"online","Survival":"offline"} — and
   * fetch it here, overriding the static values, then re-run the render. A
   * self-hosted Uptime Kuma can produce that JSON (or embed its public status
   * page). Left as a hook on purpose so the default site stays fully static.
   *
   *   fetch("status.json").then(function (r) { return r.ok ? r.json() : null; })
   *     .then(function (live) { if (live) { /* merge + re-render *\/ } })
   *     .catch(function () {});
   * ────────────────────────────────────────────────────────────────────────── */
})();
