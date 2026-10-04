(function () {
  var tela = document.getElementById("tela");
  var legenda = document.getElementById("legenda");
  var kicker = document.getElementById("kicker");
  var titulo = document.getElementById("titulo");
  var sub = document.getElementById("sub");
  var corte = document.getElementById("corte");
  var marca = document.getElementById("marca");
  var fecho = document.getElementById("fecho");

  function preencher(texto) {
    titulo.innerHTML = "";
    String(texto || "")
      .split(" ")
      .filter(Boolean)
      .forEach(function (palavra) {
        var span = document.createElement("span");
        span.className = "palavra";
        span.textContent = palavra;
        titulo.appendChild(span);
      });
  }

  window.dizer = function (opts) {
    opts = opts || {};
    var lugar = opts.lugar || "baixo";

    return new Promise(function (resolve) {
      var saida = gsap.timeline();
      saida.fromTo(
        corte,
        { scaleX: 0, autoAlpha: 1, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.16, ease: "power3.in" },
        0
      );
      saida.to(corte, {
        scaleX: 0,
        duration: 0.2,
        ease: "power2.in",
        transformOrigin: "right center",
      });
      saida.to(
        [kicker, titulo, sub],
        { y: -28, autoAlpha: 0, duration: 0.2, stagger: 0.02, ease: "power2.in" },
        0
      );
      saida.call(function () {
        legenda.dataset.lugar = lugar;
        gsap.set(legenda, { autoAlpha: 1 });
        kicker.textContent = opts.kicker || "";
        sub.textContent = opts.sub || "";
        preencher(opts.titulo);
        gsap.set(titulo, { autoAlpha: 1, y: 0 });
        gsap.set([kicker, sub], { y: 18, autoAlpha: 0 });
        gsap.to(marca, { autoAlpha: lugar === "centro" ? 0 : 1, duration: 0.3 });

        var entrada = gsap.timeline({ onComplete: resolve });
        entrada.to(kicker, {
          y: 0,
          autoAlpha: opts.kicker ? 1 : 0,
          duration: 0.32,
          ease: "power2.out",
        });
        entrada.fromTo(
          ".palavra",
          { y: 54, autoAlpha: 0, rotate: 4 },
          {
            y: 0,
            autoAlpha: 1,
            rotate: 0,
            duration: 0.58,
            stagger: 0.07,
            ease: "back.out(1.7)",
          },
          "<0.05"
        );
        entrada.to(
          sub,
          { y: 0, autoAlpha: opts.sub ? 1 : 0, duration: 0.38, ease: "power2.out" },
          "-=0.25"
        );
      });
    });
  };

  window.modo = function (nome) {
    document.body.dataset.modo = nome || "";
  };

  window.mostrarSite = function (visivel) {
    return gsap.to(tela, {
      autoAlpha: visivel ? 1 : 0,
      duration: visivel ? 0.55 : 0.35,
      ease: "power2.out",
    }).then();
  };

  window.fechar = function () {
    var tl = gsap.timeline();
    var faíscas = fecho.querySelectorAll(".brilhos i");
    tl.to([tela, legenda, marca, ".vinheta"], { autoAlpha: 0, duration: 0.35, ease: "power2.in" });
    tl.set(fecho, { display: "flex" });
    tl.from(fecho.querySelector("img"), { scale: 0.7, autoAlpha: 0, duration: 0.4, ease: "back.out(1.8)" });
    tl.from(fecho.querySelector(".kicker"), { y: 16, autoAlpha: 0, duration: 0.25 }, "-=0.15");
    tl.from(fecho.querySelector("h2"), { scale: 0.86, autoAlpha: 0, duration: 0.45, ease: "back.out(1.7)" }, "-=0.1");
    tl.from(fecho.querySelector(".ig"), { scale: 0.2, autoAlpha: 0, duration: 0.55, ease: "back.out(2)" }, "-=0.05");
    tl.from(fecho.querySelector(".arroba"), { y: 36, autoAlpha: 0, duration: 0.4, ease: "power3.out" }, "-=0.28");
    tl.to(fecho.querySelector(".ig-bloco"), {
      scale: 1.08,
      duration: 0.22,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
      transformOrigin: "50% 40%",
    });
    faíscas.forEach(function (ponto, indice) {
      var angulo = (indice / faíscas.length) * Math.PI * 2;
      tl.fromTo(
        ponto,
        { x: 0, y: 0, scale: 0.4, autoAlpha: 1 },
        {
          x: Math.cos(angulo) * 420,
          y: Math.sin(angulo) * 280,
          scale: 1,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power2.out",
          immediateRender: false,
        },
        "-=0.85"
      );
    });
    return tl.then();
  };

  window.__comercialPronto = true;
})();
