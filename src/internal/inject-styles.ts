import css from "../styles.css";

let injected = false;

export function injectStyles(): void {
  if (injected || typeof document === "undefined") return;
  // Opt-out: consumer placed <meta name="stablekit-disable-injection"> in <head>.
  if (document.querySelector('meta[name="stablekit-disable-injection"]')) {
    injected = true;
    return;
  }
  if (document.querySelector("style[data-stablekit]")) {
    injected = true;
    return;
  }
  const style = document.createElement("style");
  style.setAttribute("data-stablekit", "");
  // CSP nonce: read from <meta name="stablekit-nonce" content="...">.
  const nonceMeta = document.querySelector('meta[name="stablekit-nonce"]');
  if (nonceMeta) {
    const nonce = nonceMeta.getAttribute("content");
    if (nonce) style.setAttribute("nonce", nonce);
  }
  style.textContent = css;
  document.head.appendChild(style);
  injected = true;
}

// Eager injection at import time. Styles are ready before any component mounts.
// SSR-safe: the typeof document guard no-ops on the server.
injectStyles();
