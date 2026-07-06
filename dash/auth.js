/*
 * gaylab.me/dash — client-side login gate.
 *
 * ⚠️  HONEST SECURITY NOTE — READ THIS.
 * This runs entirely in the browser on a *static* site. There is no server to
 * check a password, so this gate is a DETERRENT, not a security boundary:
 *   • The salt + hash below ship to every visitor. A determined person can
 *     brute-force a weak password offline, or simply skip this page and hit
 *     dash.gaylab.me directly.
 *   • Therefore the REAL protection MUST live at dash.gaylab.me itself —
 *     Cloudflare Access or Tailscale (see dash/README.md). Treat this login as
 *     a nice front door, and never put anything secret in this repo.
 *
 * We still do the responsible client-side things: PBKDF2 (not plaintext, not a
 * bare SHA), a hardcoded redirect (no open-redirect via query string), and a
 * short lockout after repeated failures.
 *
 * To change the password: open dash/setpass.html in your browser, type a new
 * password, and paste the generated block over CONFIG below. The password never
 * leaves your machine.
 */
(function () {
  "use strict";

  var CONFIG = {
    // Where a successful login sends you. HARDCODED on purpose — never read this
    // from the URL/query string (that would be an open redirect).
    // PREVIEW MODE: points at the in-repo hub so admin → login → hub works end
    // to end TODAY, before dash.gaylab.me exists. Once you stand up the subdomain
    // (see network/edge/), swap this back to "https://dash.gaylab.me/".
    redirect: "./console/",

    username: "admin",                 // case-insensitive match

    // PBKDF2-SHA256. Default password is "changeme" — CHANGE IT (dash/setpass.html).
    iterations: 210000,
    salt: "467205520912ea808a55af13989ef78f",
    hash: "ed2619688e8bd65ca70ef2ac251684f6ccc1040c2236a6abb174f61e7bb24e1e"
  };

  // Lockout (deterrent only; trivially resettable, but raises the bar for casual pokes).
  var MAX_TRIES = 5;
  var LOCK_MS = 30000;

  var form = document.getElementById("auth-form");
  var stat = document.getElementById("auth-stat");
  var uEl = document.getElementById("u");
  var pEl = document.getElementById("p");
  var goEl = document.getElementById("auth-go");
  if (!form) return;

  function say(msg, kind) {
    if (!stat) return;
    stat.className = "authstat" + (kind ? " " + kind : "");
    stat.innerHTML = '<span class="pr">&gt;</span> ' + msg +
      (kind === "ok" ? '' : '<span class="cursor" aria-hidden="true"></span>');
  }

  function hexToBytes(hex) {
    var out = new Uint8Array(hex.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }
  function bytesToHex(buf) {
    var b = new Uint8Array(buf), s = "";
    for (var i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
    return s;
  }
  // constant-time-ish compare (length is public anyway)
  function safeEqual(a, b) {
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  function derive(password) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle) return Promise.reject(new Error("nocrypto"));
    var enc = new TextEncoder();
    return subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits"])
      .then(function (key) {
        return subtle.deriveBits({
          name: "PBKDF2", salt: hexToBytes(CONFIG.salt),
          iterations: CONFIG.iterations, hash: "SHA-256"
        }, key, 256);
      })
      .then(function (bits) { return bytesToHex(bits); });
  }

  // lock state (sessionStorage; deterrent, cleared on tab close)
  function lockedUntil() {
    try { return parseInt(sessionStorage.getItem("gl_lock") || "0", 10) || 0; } catch (e) { return 0; }
  }
  function tries() {
    try { return parseInt(sessionStorage.getItem("gl_tries") || "0", 10) || 0; } catch (e) { return 0; }
  }
  function setTries(n) { try { sessionStorage.setItem("gl_tries", String(n)); } catch (e) {} }
  function setLock(until) { try { sessionStorage.setItem("gl_lock", String(until)); } catch (e) {} }
  function now() { return new Date().getTime(); }

  var lockTimer = null;
  function enforceLock() {
    var until = lockedUntil();
    var remain = until - now();
    if (remain <= 0) {
      if (goEl) goEl.disabled = false;
      return false;
    }
    if (goEl) goEl.disabled = true;
    say("locked &mdash; retry in " + Math.ceil(remain / 1000) + "s", "err");
    if (lockTimer) clearTimeout(lockTimer);
    lockTimer = setTimeout(enforceLock, 1000);
    return true;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (enforceLock()) return;

    var user = (uEl && uEl.value || "").trim();
    var pass = (pEl && pEl.value) || "";
    if (!user || !pass) { say("enter login and password", "err"); return; }

    if (goEl) goEl.disabled = true;
    say("verifying&hellip;");

    derive(pass).then(function (got) {
      var ok = safeEqual(user.toLowerCase(), CONFIG.username.toLowerCase()) &&
               safeEqual(got, CONFIG.hash);
      if (ok) {
        setTries(0); setLock(0);
        say("access granted &mdash; routing to dash.gaylab.me", "ok");
        // small beat so the message is readable, then go
        setTimeout(function () { window.location.href = CONFIG.redirect; }, 650);
        return;
      }
      var t = tries() + 1;
      setTries(t);
      if (pEl) { pEl.value = ""; pEl.focus(); }
      if (t >= MAX_TRIES) {
        setTries(0);
        setLock(now() + LOCK_MS);
        enforceLock();
      } else {
        if (goEl) goEl.disabled = false;
        say("access denied &mdash; " + (MAX_TRIES - t) + " attempt" + (MAX_TRIES - t === 1 ? "" : "s") + " left", "err");
        form.classList.remove("shake"); void form.offsetWidth; form.classList.add("shake");
      }
    }).catch(function () {
      if (goEl) goEl.disabled = false;
      say("crypto unavailable &mdash; open over https", "err");
    });
  });

  // if already locked from a prior burst this session
  enforceLock();
})();
