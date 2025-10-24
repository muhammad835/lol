// scripts.js
// - Sets a scrollable srcdoc into the iframe (so this single page contains both host & demo content).
// - Keeps the iframe sized to the visible viewport using visualViewport where available (fixes mobile 100vh issues).
// - Adds a fullscreen toggle that targets the iframe element.
// - Provides "Open in new tab" by creating a blob URL of the iframe HTML (works even when using srcdoc).

(function () {
  const iframe = document.getElementById('app-frame');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const openNewTabBtn = document.getElementById('openNewTab');

  if (!iframe) {
    console.error('No iframe with id "app-frame" found.');
    return;
  }

  // The inner page HTML (srcdoc). Because this is embedded as srcdoc, it's same-origin with the parent (no sandbox),
  // so parent can access iframe.contentDocument if needed.
  const innerHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <title>Iframe inner content (scrollable)</title>
  <style>
    :root { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    html, body {
      box-sizing: border-box;
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      background: linear-gradient(180deg,#fff,#eef6ff);
      color: #0b1220;
      line-height: 1.45;
      min-height: 100%;
      height: auto;
      overflow: auto; /* allow scrolling inside the iframe */
      -webkit-overflow-scrolling: touch; /* smooth scrolling on iOS */
    }
    .wrap { max-width: 900px; margin: 0 auto; }
    header { font-size: 20px; margin-bottom: 10px; font-weight: 600; }
    p { margin-bottom: 12px; }
    .long { height: 3000px; background: linear-gradient(#ffffff66,#dfefff44); border-radius: 8px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>Iframe inner page — scroll me</header>
    <p>This document is embedded via <code>srcdoc</code>. It is intentionally long so you can test scrolling inside the iframe.</p>
    <p>If you replace this with your app, ensure that app's CSS does not force <code>overflow: hidden</code> on html/body unless you want to disable scrolling.</p>
    <div class="long"></div>
  </div>
</body>
</html>`.trim();

  // Assign the srcdoc so the iframe becomes immediately populated.
  try {
    iframe.srcdoc = innerHTML;
  } catch (e) {
    // Some older browsers may not support srcdoc attribute; fallback to writing the document after load.
    iframe.addEventListener('load', function fallbackWrite() {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(innerHTML);
        doc.close();
      } catch (err) {
        console.warn('Unable to write iframe content:', err);
      } finally {
        iframe.removeEventListener('load', fallbackWrite);
      }
    });
    // set a blank src to trigger the load
    iframe.src = 'about:blank';
  }

  // Keep a CSS variable --vh up-to-date to avoid mobile 100vh issues.
  function updateVhVar() {
    try {
      const height = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
      const vh = height * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      // Also set explicit iframe pixel size to be extra-reliable
      iframe.style.height = `calc(var(--vh, 1vh) * 100)`;
      iframe.style.width = window.innerWidth + 'px';
    } catch (e) {
      console.warn('updateVhVar error', e);
    }
  }

  updateVhVar();
  window.addEventListener('resize', updateVhVar, { passive: true });
  window.addEventListener('orientationchange', updateVhVar, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateVhVar, { passive: true });
    window.visualViewport.addEventListener('scroll', updateVhVar, { passive: true });
  }

  // Toggle fullscreen on the iframe element itself for best UX.
  async function toggleFullscreen() {
    try {
      // If we are currently in fullscreen, exit
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        return;
      }

      // Request fullscreen on the iframe element (preferred).
      if (iframe.requestFullscreen) {
        await iframe.requestFullscreen({ navigationUI: 'hide' });
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        // Fallback: make the whole document fullscreen
        await document.documentElement.requestFullscreen();
      } else {
        console.warn('Fullscreen API is not supported by this browser.');
      }
    } catch (err) {
      console.warn('Error toggling fullscreen:', err);
    }
  }

  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Open the iframe content in a new tab by making a blob of the HTML.
  openNewTabBtn.addEventListener('click', function () {
    try {
      const blob = new Blob([innerHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      // Open in a new tab
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      if (w) {
        // Release the object URL after a short delay to ensure the new tab has loaded it.
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      } else {
        console.warn('Popup blocked — could not open new tab.');
      }
    } catch (err) {
      console.warn('Could not open new tab:', err);
    }
  });

  // After the iframe loads, try to ensure its inner document allows scrolling (works only when same-origin).
  iframe.addEventListener('load', function () {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (doc) {
        // Ensure inner document isn't forcing overflow:hidden on html/body
        doc.documentElement.style.minHeight = '100%';
        doc.documentElement.style.height = 'auto';
        doc.documentElement.style.overflow = 'auto';
        doc.body.style.minHeight = '100%';
        doc.body.style.height = 'auto';
        doc.body.style.overflow = 'auto';
      }
    } catch (e) {
      // Cross-origin => cannot access — that's OK; inner page controls its own scrolling.
    }
  });

  // Keyboard accessibility: Ctrl/Cmd + Shift + F toggles fullscreen.
  window.addEventListener('keydown', (ev) => {
    if ((ev.key === 'F' || ev.key === 'f') && (ev.ctrlKey || ev.metaKey) && ev.shiftKey) {
      ev.preventDefault();
      toggleFullscreen();
    }
  });
})();
