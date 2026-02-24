/* ============================================
   PÁGINA DO CONVITE
   Draw path, ScrollTrigger (descer a página), contagem regressiva
   ============================================ */

const CONVITE_DATE = new Date("2026-05-09T19:30:00");

function initCountdown() {
  const elDays = document.getElementById("countDays");
  const elHours = document.getElementById("countHours");
  const elMinutes = document.getElementById("countMinutes");
  const elSeconds = document.getElementById("countSeconds");
  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  function update() {
    const now = new Date();
    const diff = CONVITE_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      elDays.textContent = "0";
      elHours.textContent = "0";
      elMinutes.textContent = "0";
      elSeconds.textContent = "0";
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    elDays.textContent = String(days);
    elHours.textContent = String(hours).padStart(2, "0");
    elMinutes.textContent = String(minutes).padStart(2, "0");
    elSeconds.textContent = String(seconds).padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
}

function initScrollTrigger() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const sections = [
    "#conviteSectionData",
    "#conviteSectionLocal",
    "#conviteSectionTraje",
    "#conviteSectionCountdown",
    "#conviteSectionButtons",
  ];

  sections.forEach((selector) => {
    const el = document.querySelector(selector);
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          end: "top 55%",
          toggleActions: "play none none none",
        },
      }
    );
  });
}

function initConvite() {
  const apagao = document.getElementById("conviteApagao");
  const unified = document.getElementById("conviteUnified");
  const modal = document.getElementById("conviteModal");
  const path = document.getElementById("conviteUnifiedPath");
  const backdrop = document.querySelector(".convite-backdrop");
  const brilho = document.querySelector(".convite-brilho");

  if (!modal || !unified) return;

  initCountdown();

  if (!path || typeof gsap === "undefined") {
    if (apagao) apagao.classList.add("is-aberto");
    if (unified) gsap.set(unified, { opacity: 1, y: 0, scale: 1 });
    modal.classList.add("is-visible", "is-content-visible");
    if (backdrop) backdrop.classList.add("is-visible");
    if (brilho) brilho.classList.add("is-visible");
    initScrollTrigger();
    return;
  }

  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = pathLength;
  gsap.set(path, { strokeDashoffset: pathLength });
  gsap.set(unified, { opacity: 0, y: 24, scale: 0.98 });

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    onComplete: () => {
      modal.classList.add("is-visible");
      if (apagao) apagao.style.pointerEvents = "none";
      initScrollTrigger();
    },
  });

  // 1. Apagão abre
  if (apagao) {
    tl.add(() => apagao.classList.add("is-aberto"));
    tl.to(apagao, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
    });
  }

  // 2. Desfoco e brilho
  tl.to(
    backdrop,
    { opacity: 1, duration: 1.05, ease: "power2.out" },
    "-=0.95"
  );
  tl.add(() => {
    backdrop.classList.add("is-visible");
    if (brilho) brilho.classList.add("is-visible");
  }, "-=1.05");

  // 3. Modal unificado entra (fade + scale + slide) em todo o card
  tl.to(
    unified,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.25,
      ease: "power2.out",
    },
    "-=0.7"
  );

  // 4. Modal interno visível
  tl.set(modal, { opacity: 1, visibility: "visible" }, "-=0.6");

  // 5. Draw path: contorno desenhado em todo o modal unificado
  tl.to(path, {
    strokeDashoffset: 0,
    duration: 1.8,
    ease: "power2.inOut",
  });

  // 6. Revela conteúdo com stagger elegante
  tl.add(() => {
    modal.classList.add("is-content-visible");
  }, "-=0.2");
}

function initModals() {
  const PIX_KEY_RAW = "55365597885";
  const btnSugestao = document.getElementById("btnSugestaoPresente");
  const btnPix = document.getElementById("btnPix");
  const overlaySugestoes = document.getElementById("overlaySugestoes");
  const overlayPix = document.getElementById("overlayPix");
  const closeSugestoes = document.getElementById("closeSugestoes");
  const closePix = document.getElementById("closePix");
  const btnCopyPix = document.getElementById("btnCopyPix");

  function openModal(overlay) {
    if (overlay) {
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
    }
  }

  function closeModal(overlay) {
    if (overlay) {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }
  }

  if (btnSugestao && overlaySugestoes) {
    btnSugestao.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(overlaySugestoes);
    });
  }
  if (closeSugestoes && overlaySugestoes) {
    closeSugestoes.addEventListener("click", () => closeModal(overlaySugestoes));
    overlaySugestoes.addEventListener("click", (e) => {
      if (e.target === overlaySugestoes) closeModal(overlaySugestoes);
    });
  }

  if (btnPix && overlayPix) {
    btnPix.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(overlayPix);
    });
  }
  if (closePix && overlayPix) {
    closePix.addEventListener("click", () => closeModal(overlayPix));
    overlayPix.addEventListener("click", (e) => {
      if (e.target === overlayPix) closeModal(overlayPix);
    });
  }

  if (btnCopyPix) {
    btnCopyPix.addEventListener("click", () => {
      navigator.clipboard.writeText(PIX_KEY_RAW).then(() => {
        const label = btnCopyPix.textContent;
        btnCopyPix.textContent = "Copiado!";
        btnCopyPix.classList.add("copied");
        setTimeout(() => {
          btnCopyPix.textContent = label;
          btnCopyPix.classList.remove("copied");
        }, 2000);
      }).catch(() => {});
    });
  }
}

function initBgMusic() {
  const audio = document.getElementById("bgMusic");
  if (!audio) return;

  audio.volume = 0.45;

  const toggleBtn = document.getElementById("audioToggle");

  const updateToggleState = () => {
    if (!toggleBtn) return;
    if (audio.muted || audio.paused) {
      toggleBtn.classList.add("is-muted");
      toggleBtn.setAttribute("aria-label", "Ativar música");
    } else {
      toggleBtn.classList.remove("is-muted");
      toggleBtn.setAttribute("aria-label", "Mutar música");
    }
  };

  const tryPlay = () => {
    audio
      .play()
      .then(() => {})
      .catch(() => {
        // Alguns navegadores móveis podem bloquear autoplay com som;
        // ainda assim tentamos novamente quando o usuário voltar para a aba.
      });
  };

  const pauseAudio = () => {
    if (!audio.paused) {
      audio.pause();
    }
  };

  // Tenta tocar assim que a página estiver pronta (autoplay-friendly em muitos navegadores)
  tryPlay();
  updateToggleState();

  // Pausa quando o usuário sai do navegador/aba e tenta retomar ao voltar
  const handleVisibility = () => {
    if (document.hidden) {
      pauseAudio();
    } else {
      tryPlay();
      updateToggleState();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("pagehide", pauseAudio);
  window.addEventListener("blur", pauseAudio);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      // Alterna mute; se desmutar, garante que está tocando
      const willBeMuted = !audio.muted;
      audio.muted = willBeMuted;
      if (!willBeMuted) {
        tryPlay();
      } else {
        pauseAudio();
      }
      updateToggleState();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initConvite();
    initModals();
    initBgMusic();
  });
} else {
  initConvite();
  initModals();
  initBgMusic();
}
