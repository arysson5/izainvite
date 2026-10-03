/**
 * Reel 9:16 do XV da Iza.
 * Timeline GSAP com labels. Em ?record=1 o relógio global fica pausado
 * e cada quadro é buscado por window.renderAt(segundos).
 */
(function () {
  var record = new URLSearchParams(window.location.search).has("record");
  var stage = document.getElementById("stage");
  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fit() {
    var scale = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
    stage.style.transform = "scale(" + scale + ")";
  }

  fit();
  window.addEventListener("resize", fit);

  function waitAssets() {
    var fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    var images = Array.prototype.map.call(document.images, function (img) {
      if (img.complete) return Promise.resolve();
      return new Promise(function (resolve) {
        img.onload = img.onerror = resolve;
      });
    });
    return Promise.all([fonts].concat(images));
  }

  function showStatic() {
    var poster = document.querySelector(".scene-static");
    poster.hidden = false;
    gsap.set(".flash", { autoAlpha: 0 });
    document.documentElement.classList.remove("reel-booting");
  }

  function spawnParticles() {
    var layer = document.getElementById("particles");
    var i;
    for (i = 0; i < 28; i += 1) {
      var el = document.createElement("span");
      el.className = "particle";
      layer.appendChild(el);
      var x = gsap.utils.random(48, 1032);
      var y = gsap.utils.random(180, 1740);
      gsap.set(el, {
        x: x,
        y: y,
        scale: gsap.utils.random(0.4, 1.45),
      });
      gsap.to(el, {
        y: y - gsap.utils.random(70, 190),
        duration: gsap.utils.random(7, 13),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: gsap.utils.random(0, 1.5),
      });
      gsap.to(el, {
        autoAlpha: gsap.utils.random(0.2, 0.9),
        duration: gsap.utils.random(2.4, 4.2),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }

  function driftBokeh() {
    gsap.utils.toArray(".bokeh-orb").forEach(function (orb, index) {
      gsap.to(orb, {
        y: index % 2 === 0 ? -50 : 40,
        x: index % 2 === 0 ? 24 : -20,
        duration: 9 + index,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  }

  function cut(tl, at) {
    var closeAt = typeof at === "number" ? at + 0.2 : at + "+=0.2";
    tl.fromTo(
      ".slash",
      { scaleX: 0, autoAlpha: 1, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 0.2,
        ease: "power3.in",
        immediateRender: false,
      },
      at
    );
    tl.to(
      ".slash",
      {
        scaleX: 0,
        autoAlpha: 0,
        duration: 0.24,
        ease: "power2.in",
        transformOrigin: "right center",
        immediateRender: false,
      },
      closeAt
    );
  }

  function build() {
    var tl = gsap.timeline({
      defaults: { duration: 0.7, ease: "power3.out" },
    });

    spawnParticles();
    driftBokeh();

    tl.fromTo(
      ".bg",
      { scale: 1, y: 0 },
      { scale: 1.08, y: -36, duration: 21, ease: "none" },
      0
    );

    tl.to(".flash", { autoAlpha: 0, duration: 0.55, ease: "power2.out" }, 0);

    tl.addLabel("hook", 0.08);
    tl.from(".hook-eyebrow", { y: 22, autoAlpha: 0, duration: 0.45 }, "hook");
    tl.from(
      ".hook-title",
      { scale: 1.22, autoAlpha: 0, duration: 0.8, ease: "power4.out" },
      "hook+=0.05"
    );
    tl.from(".hook-script", { y: 40, autoAlpha: 0, duration: 0.75 }, "hook+=0.32");
    tl.fromTo(
      ".hook-sheen",
      { xPercent: -140, autoAlpha: 0 },
      { xPercent: 160, autoAlpha: 1, duration: 0.85, ease: "power2.inOut" },
      "hook+=0.55"
    );
    tl.to(".hook-sheen", { autoAlpha: 0, duration: 0.2 }, "hook+=1.25");

    gsap.utils.toArray(".burst span").forEach(function (spark, index) {
      var angle = (index / 12) * Math.PI * 2;
      tl.fromTo(
        spark,
        { x: 0, y: 0, scale: 0.3, autoAlpha: 1 },
        {
          x: Math.cos(angle) * 300,
          y: Math.sin(angle) * 220,
          scale: 1,
          autoAlpha: 0,
          duration: 0.95,
          ease: "power2.out",
          immediateRender: false,
        },
        "hook+=0.12"
      );
    });

    tl.addLabel("leaveHook", 3.05);
    cut(tl, "leaveHook");
    tl.to(
      ".scene-hook",
      { autoAlpha: 0, y: -36, duration: 0.38, ease: "power2.in" },
      "leaveHook+=0.12"
    );

    tl.addLabel("invite", 3.4);
    tl.from(
      ".envelope",
      {
        y: 90,
        scale: 0.82,
        rotation: -5,
        autoAlpha: 0,
        duration: 1.05,
        ease: "back.out(1.6)",
      },
      "invite"
    );
    tl.from(".invite-eyebrow", { y: 16, autoAlpha: 0, duration: 0.4 }, "invite+=0.28");
    tl.from(".invite-lead", { y: 28, autoAlpha: 0, duration: 0.5 }, "invite+=0.38");
    tl.from(
      ".invite-word",
      { y: 48, scale: 0.92, autoAlpha: 0, duration: 0.62, ease: "back.out(1.7)" },
      "invite+=0.5"
    );
    tl.fromTo(
      ".invite-sheen",
      { xPercent: -140, autoAlpha: 0 },
      { xPercent: 180, autoAlpha: 1, duration: 0.8, ease: "power2.inOut" },
      "invite+=0.85"
    );
    tl.to(".invite-sheen", { autoAlpha: 0, duration: 0.2 }, "invite+=1.5");

    tl.addLabel("leaveInvite", 6.45);
    cut(tl, "leaveInvite");
    tl.to(
      ".scene-invite",
      { autoAlpha: 0, y: -24, scale: 0.96, duration: 0.38, ease: "power2.in" },
      "leaveInvite+=0.12"
    );

    tl.addLabel("date", 6.8);
    tl.from(".date-eyebrow", { y: 16, autoAlpha: 0, duration: 0.4 }, "date");
    tl.from(
      ".num",
      { scale: 1.45, autoAlpha: 0, duration: 0.55, ease: "power4.out" },
      "date+=0.06"
    );
    tl.from(".month", { y: 24, autoAlpha: 0, duration: 0.45 }, "date+=0.28");
    tl.from(".year", { y: 16, autoAlpha: 0, duration: 0.4 }, "date+=0.4");
    tl.from(
      ".pill",
      { scale: 0.8, autoAlpha: 0, duration: 0.45, ease: "back.out(1.8)" },
      "date+=0.55"
    );

    tl.addLabel("leaveDate", 9.7);
    cut(tl, "leaveDate");
    tl.to(
      ".scene-date",
      { autoAlpha: 0, y: -20, duration: 0.36, ease: "power2.in" },
      "leaveDate+=0.12"
    );

    tl.addLabel("place", 10.05);
    tl.from(".place-eyebrow", { y: 16, autoAlpha: 0, duration: 0.4 }, "place");
    tl.from(
      ".place-name",
      { y: 50, autoAlpha: 0, duration: 0.7, ease: "power4.out" },
      "place+=0.1"
    );

    tl.addLabel("leavePlace", 12.55);
    cut(tl, "leavePlace");
    tl.to(
      ".scene-place",
      { autoAlpha: 0, y: -20, duration: 0.36, ease: "power2.in" },
      "leavePlace+=0.12"
    );

    tl.addLabel("dress", 12.9);
    tl.from(".dress-eyebrow", { y: 16, autoAlpha: 0, duration: 0.4 }, "dress");
    tl.from(
      ".dress-name",
      { scale: 0.9, autoAlpha: 0, duration: 0.6, ease: "back.out(1.5)" },
      "dress+=0.08"
    );

    tl.addLabel("leaveDress", 15.15);
    cut(tl, "leaveDress");
    tl.to(
      ".scene-dress",
      { autoAlpha: 0, y: -16, duration: 0.34, ease: "power2.in" },
      "leaveDress+=0.12"
    );

    tl.addLabel("cta", 15.5);
    tl.from(
      ".logo",
      { scale: 0.72, autoAlpha: 0, duration: 0.8, ease: "back.out(1.6)" },
      "cta"
    );
    tl.from(".cta-eyebrow", { y: 14, autoAlpha: 0, duration: 0.4 }, "cta+=0.25");
    tl.from(
      ".cta-title",
      { y: 36, autoAlpha: 0, duration: 0.6, ease: "power3.out" },
      "cta+=0.38"
    );
    tl.from(".lockup", { y: 16, autoAlpha: 0, duration: 0.45, stagger: 0.12 }, "cta+=0.62");
    tl.fromTo(
      ".ring",
      { scale: 0.55, autoAlpha: 0.85 },
      {
        scale: 1.55,
        autoAlpha: 0,
        duration: 1.3,
        ease: "power1.out",
        repeat: 2,
        immediateRender: false,
      },
      "cta+=0.45"
    );

    return tl;
  }

  waitAssets().then(function () {
    if (!record && reduce) {
      showStatic();
      return;
    }

    if (record) {
      gsap.globalTimeline.pause(0);
    }

    var tl = build();
    document.documentElement.classList.remove("reel-booting");

    if (record) {
      window.renderAt = function (time) {
        gsap.globalTimeline.time(time);
      };
      window.__reelDuration = 21;
      window.__reelReady = true;
      window.renderAt(0);
      return;
    }

    stage.addEventListener("click", function () {
      tl.restart();
    });
  });
})();
