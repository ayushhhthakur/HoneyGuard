/**
 * HoneyGuard fingerprint collector.
 *
 * Embed like:
 *   <script src="https://YOUR_API/fp.js" data-token="TOKEN" data-api="https://YOUR_API" async></script>
 *
 * Collects the same class of signals BrowserLeaks surfaces (canvas/WebGL/
 * audio rendering hashes, fonts, screen, timezone, navigator leaks) and
 * POSTs them to /fingerprint/:token. Runs entirely client-side, self-hosted
 * — no third party ever sees the attacker's traffic.
 */
(function () {
  try {
    var scriptEl = document.currentScript;
    var token = scriptEl && scriptEl.dataset ? scriptEl.dataset.token : null;
    var apiBase = (scriptEl && scriptEl.dataset ? scriptEl.dataset.api : '') || '';
    if (!token) return;

    function hashString(str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
      }
      return (hash >>> 0).toString(16);
    }

    function canvasFingerprint() {
      try {
        var canvas = document.createElement('canvas');
        canvas.width = 220;
        canvas.height = 30;
        var ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('HoneyGuard fp \ud83d\udc1d', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('HoneyGuard fp \ud83d\udc1d', 4, 17);
        return hashString(canvas.toDataURL());
      } catch (e) {
        return null;
      }
    }

    function webglInfo() {
      try {
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return { hash: null, vendor: null, renderer: null };
        var dbg = gl.getExtension('WEBGL_debug_renderer_info');
        var vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
        var renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
        return { hash: hashString(String(vendor) + String(renderer)), vendor: String(vendor), renderer: String(renderer) };
      } catch (e) {
        return { hash: null, vendor: null, renderer: null };
      }
    }

    function audioFingerprint() {
      return new Promise(function (resolve) {
        try {
          var AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
          if (!AudioCtx) return resolve(null);
          var context = new AudioCtx(1, 5000, 44100);
          var oscillator = context.createOscillator();
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(10000, context.currentTime);
          var compressor = context.createDynamicsCompressor();
          oscillator.connect(compressor);
          compressor.connect(context.destination);
          oscillator.start(0);
          context.startRendering();
          context.oncomplete = function (evt) {
            try {
              var output = evt.renderedBuffer.getChannelData(0);
              var sum = 0;
              for (var i = 0; i < output.length; i += 100) sum += Math.abs(output[i]);
              resolve(hashString(sum.toString()));
            } catch (e) {
              resolve(null);
            }
          };
          setTimeout(function () { resolve(null); }, 1500);
        } catch (e) {
          resolve(null);
        }
      });
    }

    function detectFonts() {
      var testFonts = [
        'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Comic Sans MS',
        'Impact', 'Trebuchet MS', 'Segoe UI', 'Helvetica', 'Calibri', 'Cambria', 'Consolas',
      ];
      var baseFonts = ['monospace', 'sans-serif', 'serif'];
      var testString = 'mmmmmmmmmmlli';
      var testSize = '72px';
      var span = document.createElement('span');
      span.style.position = 'absolute';
      span.style.left = '-9999px';
      span.style.fontSize = testSize;
      span.innerHTML = testString;
      document.body.appendChild(span);

      var baseSizes = {};
      baseFonts.forEach(function (base) {
        span.style.fontFamily = base;
        baseSizes[base] = { w: span.offsetWidth, h: span.offsetHeight };
      });

      var detected = testFonts.filter(function (font) {
        return baseFonts.some(function (base) {
          span.style.fontFamily = font + ',' + base;
          return span.offsetWidth !== baseSizes[base].w || span.offsetHeight !== baseSizes[base].h;
        });
      });

      document.body.removeChild(span);
      return detected;
    }

    function detectIncognitoGuess() {
      // Heuristic only, never certain: low storage quota estimate is a
      // common (not definitive) private-browsing signal.
      try {
        if (navigator.storage && navigator.storage.estimate) {
          return navigator.storage.estimate().then(function (est) {
            return (est.quota || 0) < 120 * 1024 * 1024;
          });
        }
      } catch (e) {}
      return Promise.resolve(null);
    }

    Promise.all([audioFingerprint(), detectIncognitoGuess()]).then(function (results) {
      var audioHash = results[0];
      var incognitoGuess = results[1];
      var webgl = webglInfo();

      var payload = {
        canvasHash: canvasFingerprint(),
        webglHash: webgl.hash,
        webglVendor: webgl.vendor,
        webglRenderer: webgl.renderer,
        audioHash: audioHash,
        screenResolution: screen.width + 'x' + screen.height,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        languages: navigator.languages ? Array.prototype.slice.call(navigator.languages) : [navigator.language],
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency || null,
        deviceMemory: navigator.deviceMemory || null,
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        fonts: detectFonts(),
        plugins: navigator.plugins ? Array.prototype.map.call(navigator.plugins, function (p) { return p.name; }) : [],
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || null,
        webdriver: navigator.webdriver === true,
        incognitoGuess: incognitoGuess,
      };

      payload.fingerprintHash = hashString(JSON.stringify(payload));

      var url = (apiBase || '') + '/fingerprint/' + encodeURIComponent(token);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(function () {});
      }
    });
  } catch (e) {
    // Fail silently — a fingerprinting error must never reveal the honeypot.
  }
})();
