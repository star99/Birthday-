(function () {
  "use strict";

  var BLOOM_IMAGES = [
    "/assets/flower/flower.png",
    "/assets/flower/f2.png",
    "/assets/flower/f3.png",
    "/assets/flower/f4.png",
    "/assets/flower/f5.png",
    "/assets/flower/f6.png",
    "/assets/flower/f7.png",
    "/assets/flower/f8.png",
    "/assets/flower/f9.png",
    "/assets/flower/f10.png",
    "/assets/flower/p21.png",
    "/assets/flower/p22.png",
    "/assets/flower/p23.png",
    "/assets/flower/p24.png",
    "/assets/flower/p25.png",
    "/assets/flower/p26.png",
    "/assets/flower/p27.png",
    "/assets/flower/p28.png",
    "/assets/flower/p29.png",
    "/assets/flower/p30.png",
  ];

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function easeInCubic(t) {
    return t * t * t;
  }

  function quadBezier(p0, c, p1, t) {
    var u = 1 - t;
    return u * u * p0 + 2 * u * t * c + t * t * p1;
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var overlay = document.getElementById("fr-overlay");
    var hero = document.getElementById("fr-hero");
    var bg = document.getElementById("fr-bg");
    var glow = document.getElementById("fr-glow");
    var flowers = document.getElementById("fr-flowers");
    if (!overlay || !hero || !bg || !glow || !flowers) return;

    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var startX = vw * 0.88;
    var startY = vh * 0.1;
    var landX = vw * 0.14;
    var landY = vh * 0.88;
    var heroSize = 92;
    var startRot = 18;
    var landRot = -320;

    var ctrlX = startX + (landX - startX) * 0.62;
    var ctrlY = startY + (landY - startY) * 0.16;

    hero.style.width = heroSize + "px";
    hero.style.height = heroSize + "px";
    hero.style.marginLeft = -(heroSize / 2) + "px";
    hero.style.marginTop = -(heroSize / 2) + "px";
    hero.style.left = startX + "px";
    hero.style.top = startY + "px";

    var originXPct = (landX / vw) * 100 + "%";
    var originYPct = (landY / vh) * 100 + "%";
    glow.style.setProperty("--fr-origin-x", originXPct);
    glow.style.setProperty("--fr-origin-y", originYPct);

    var startDelay = reduceMotion ? 30 : 350;
    var fallMs = reduceMotion ? 150 : 950;
    var pauseMs = reduceMotion ? 80 : 1000;
    var gushWaveDur = reduceMotion ? 150 : 2000;
    var pieceMinDur = reduceMotion ? 150 : 1300;
    var pieceMaxDur = reduceMotion ? 220 : 1700;
    var extraJitter = reduceMotion ? 20 : 180;
    var layeredExtraDelay = reduceMotion ? 30 : 450;
    var holdMs = reduceMotion ? 100 : 400;
    var dissolveMs = reduceMotion ? 200 : 1100;

    var started = false;
    hero.style.cursor = "pointer";
    hero.setAttribute("role", "button");
    hero.setAttribute("aria-label", "Click the flower to begin");

    var prompt = document.createElement("div");
    prompt.id = "fr-click-prompt";
    prompt.textContent = "Touch the blossom";
    overlay.appendChild(prompt);

    hero.addEventListener("click", beginExperience);

    function beginExperience() {
      if (started) return;
      started = true;
      hero.removeEventListener("click", beginExperience);
      hero.style.cursor = "default";

      var music = new Audio("/assets/music.mp3");
      music.loop = true;
      music.play().catch(function () {});

      prompt.classList.add("fr-prompt-hide");
      setTimeout(function () {
        if (prompt.parentNode) prompt.parentNode.removeChild(prompt);
      }, 320);

      setTimeout(startFall, startDelay);
    }

    function startFall() {
      if (reduceMotion) {
        hero.style.left = landX + "px";
        hero.style.top = landY + "px";
        finishFall();
        return;
      }

      var t0 = null;
      var lastGhost = 0;

      function frame(now) {
        if (t0 === null) t0 = now;
        var raw = Math.min(1, (now - t0) / fallMs);
        var eased = easeInCubic(raw);

        var x = quadBezier(startX, ctrlX, landX, eased);
        var y = quadBezier(startY, ctrlY, landY, eased);
        var rot = startRot + (landRot - startRot) * eased;
        var scale = 1 + 0.3 * eased;

        hero.style.left = x + "px";
        hero.style.top = y + "px";
        hero.style.transform =
          "rotate(" + rot + "deg) scale(" + scale + ")";

        if (now - lastGhost > 55 && raw < 0.92) {
          lastGhost = now;
          spawnGhost(x, y, 1 - raw);
        }

        if (raw < 1) {
          requestAnimationFrame(frame);
        } else {
          hero.style.setProperty(
            "--fr-land-transform",
            "rotate(" + landRot + "deg) scale(1.3)",
          );
          finishFall();
        }
      }
      requestAnimationFrame(frame);
    }

    function finishFall() {
      hero.classList.add("fr-landed");
      glow.classList.add("fr-show");
      setTimeout(startGush, pauseMs);
    }

    function spawnGhost(x, y, progressLeft) {
      var size = 16 + 26 * progressLeft;
      var ghost = document.createElement("div");
      ghost.className = "fr-trail";
      ghost.style.left = x + "px";
      ghost.style.top = y + "px";
      ghost.style.width = size + "px";
      ghost.style.height = size + "px";
      ghost.style.marginLeft = -(size / 2) + "px";
      ghost.style.marginTop = -(size / 2) + "px";
      overlay.appendChild(ghost);
      requestAnimationFrame(function () {
        ghost.classList.add("fr-fade");
      });
      setTimeout(function () {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      }, 520);
    }

    function buildPieceList() {
      var targetCellArea = reduceMotion ? 55000 : 6500;
      var cellCount = Math.min(
        170,
        Math.max(30, Math.round((vw * vh) / targetCellArea)),
      );
      var cellSize = Math.sqrt((vw * vh) / cellCount);
      var cols = Math.max(1, Math.round(vw / cellSize));
      var rows = Math.max(1, Math.round(vh / cellSize));
      var cellW = vw / cols;
      var cellH = vh / rows;
      var maxDist = Math.hypot(vw, vh);
      var list = [];

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var px = cellW * (c + 0.5) + rand(-cellW * 0.35, cellW * 0.35);
          var py = cellH * (r + 0.5) + rand(-cellH * 0.35, cellH * 0.35);
          list.push(makePiece(px, py, cellSize, false));
        }
      }

      var extra = Math.round(list.length * 0.45);
      for (var i = 0; i < extra; i++) {
        list.push(makePiece(rand(0, vw), rand(0, vh), cellSize, true));
      }

      return list;

      function makePiece(px, py, baseCell, layered) {
        var dist = Math.hypot(px - landX, py - landY);
        var delay =
          (dist / maxDist) * gushWaveDur +
          rand(0, extraJitter) +
          (layered ? rand(150, layeredExtraDelay) : 0);
        var size = baseCell * rand(1.35, 1.95);
        var scale = rand(0.95, 1.2);
        var oscale = scale * rand(1.05, 1.18);
        var rot0 = rand(-45, 45);
        var rot1 = rot0 + rand(-150, 150);
        var rot2 = rot1 + rand(-40, 40);
        return {
          img: pick(BLOOM_IMAGES),
          size: size,
          tx: px - landX,
          ty: py - landY,
          mx: (px - landX) * rand(1.05, 1.15),
          my: (py - landY) * rand(1.05, 1.15),
          scale: scale,
          oscale: oscale,
          rot0: rot0,
          rot1: rot1,
          rot2: rot2,
          dur: rand(pieceMinDur, pieceMaxDur),
          delay: delay,
          opacity: rand(0.93, 1),
        };
      }
    }

    function startGush() {
      hero.style.transition = "opacity 350ms ease-out";
      hero.style.opacity = "0";

      var pieces = buildPieceList();
      var maxEnd = 0;

      pieces.forEach(function (p) {
        appendPiece(p);
        maxEnd = Math.max(maxEnd, p.delay + p.dur);
      });

      setTimeout(openReveal, maxEnd + holdMs);
    }

    function appendPiece(p) {
      var el = document.createElement("img");
      el.className = "fr-piece";
      el.src = p.img;
      el.alt = "";
      el.style.setProperty("--fr-size", p.size + "px");
      el.style.setProperty("--fr-x", landX + "px");
      el.style.setProperty("--fr-y", landY + "px");
      el.style.setProperty("--fr-tx", p.tx + "px");
      el.style.setProperty("--fr-ty", p.ty + "px");
      el.style.setProperty("--fr-mx", p.mx + "px");
      el.style.setProperty("--fr-my", p.my + "px");
      el.style.setProperty("--fr-scale", p.scale);
      el.style.setProperty("--fr-oscale", p.oscale);
      el.style.setProperty("--fr-rot0", p.rot0 + "deg");
      el.style.setProperty("--fr-rot1", p.rot1 + "deg");
      el.style.setProperty("--fr-rot2", p.rot2 + "deg");
      el.style.setProperty("--fr-dur", p.dur + "ms");
      el.style.setProperty("--fr-delay", p.delay + "ms");
      el.style.setProperty("--fr-opacity", p.opacity);
      flowers.appendChild(el);
    }

    function openReveal() {
      overlay.style.pointerEvents = "none";
      overlay.classList.add("fr-dissolve");
      setTimeout(function () {
        overlay.style.display = "none";
      }, dissolveMs + 150);
    }
  });
})();
