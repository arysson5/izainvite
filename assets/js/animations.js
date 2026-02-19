/* ============================================
   GERENCIADOR DE ANIMAÇÕES GSAP
   Estilo Victoria's Secret - Extremamente Suave e Elegante
   ============================================ */

class AnimationManager {
  constructor(config) {
    this.config = config.animations;
    this.cartaElement = document.getElementById("carta");
    this.clickIndicator = document.getElementById("clickIndicator");
    this.logoExpansion = document.getElementById("logoExpansion");
    this.logoImage = document.getElementById("logoImage");
    this.brilhoTransition = document.getElementById("brilhoTransition");
    this.backgroundOverlay = document.getElementById("backgroundOverlay");
    this.videoFullscreen = document.getElementById("videoFullscreen");
    this.conviteVideo = document.getElementById("conviteVideo");
    this.videoFadeOverlay = document.getElementById("videoFadeOverlay");
    this.containerElement = document.querySelector(".container");
    this.backgroundElement = document.getElementById("background");
    this.cartaLayer = document.querySelector(".carta-main");
    this.cartaImage = document.getElementById("cartaImage");
    this.mouseX = 0;
    this.mouseY = 0;

    // Detectar mobile para otimizações de performance
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      window.innerWidth <= 768 ||
      "ontouchstart" in window;

    // Reduzir qualidade de filtros em mobile para melhor performance
    if (this.isMobile && this.cartaImage) {
      this.cartaImage.style.willChange = "transform, opacity";
    }

    this.init();
  }

  init() {
    if (typeof gsap === "undefined") {
      console.error("GSAP não foi carregado!");
      return;
    }

    gsap.registerPlugin();

    // Configurar estados iniciais
    this.setupInitialStates();

    // Iniciar animação MUITO SUAVE e elegante
    setTimeout(() => {
      this.setupSmoothEntrance();
    }, 300);

    this.setupClickIndicatorAnimation();
    this.setupInteractions();
    // setupBrilhoEffect removido - removendo animação de piscar da carta
    this.setup3DHoverAnimation();
  }

  setupInitialStates() {
    // Carta principal
    if (this.cartaLayer) {
      gsap.set(this.cartaLayer, {
        opacity: 0,
        scale: 0.85,
        y: 40,
        z: -800,
        rotationY: 0,
        rotationX: 0,
      });
    }

    // Carta container
    if (this.cartaElement) {
      gsap.set(this.cartaElement, {
        scale: 0.8,
        rotationY: 0,
        rotationX: 0,
        z: -300,
        opacity: 0,
      });
    }

    // Indicador de clique
    if (this.clickIndicator) {
      gsap.set(this.clickIndicator, {
        opacity: 0,
        scale: 0.8,
      });
    }

    // Logo de expansão (oculto)
    if (this.logoExpansion) {
      gsap.set(this.logoExpansion, {
        opacity: 0,
        scale: 0.3,
        z: -1000,
      });
    }

    // Brilho de transição (oculto)
    if (this.brilhoTransition) {
      gsap.set(this.brilhoTransition, {
        opacity: 0,
        scale: 0.5,
      });
    }

    // Overlay de background (oculto)
    if (this.backgroundOverlay) {
      gsap.set(this.backgroundOverlay, {
        opacity: 0,
      });
    }
  }

  setupSmoothEntrance() {
    if (!this.cartaElement) return;

    // Otimizações para mobile: reduzir duração e simplificar animações
    const duration = this.isMobile
      ? this.config.entrada.duration * 0.7
      : this.config.entrada.duration;
    const layerDuration = this.isMobile ? 2 : 3;
    const floatDuration = this.isMobile ? 1 : 1.5;
    const skipFloat = this.isMobile; // Pular flutuação em mobile para melhor performance

    const masterTimeline = gsap.timeline();

    // Animação MUITO SUAVE e elegante (otimizada para mobile)
    masterTimeline
      // 1. Carta container aparece suavemente do fundo
      .to(this.cartaElement, {
        duration: duration,
        scale: 1,
        z: -200,
        opacity: 1,
        ease: this.isMobile ? "power1.out" : this.config.entrada.ease, // Easing mais simples em mobile
        force3D: true, // Forçar aceleração GPU
      })
      // 2. Carta principal aparece com fade in suave
      .to(
        this.cartaLayer,
        {
          duration: layerDuration,
          opacity: 1,
          scale: 1,
          y: 0,
          z: 150,
          rotationY: 0,
          rotationX: 0,
          ease: "power1.out",
          force3D: true,
        },
        `-=${this.config.entrada.stagger}`
      );

    // 3. Pequena animação de flutuação (apenas desktop)
    if (!skipFloat) {
      masterTimeline
        .to(
          this.cartaElement,
          {
            duration: floatDuration,
            y: -10,
            ease: "sine.inOut",
            force3D: true,
          },
          "-=2"
        )
        .to(this.cartaElement, {
          duration: floatDuration,
          y: 0,
          ease: "sine.inOut",
          force3D: true,
        });
    }

    // 4. Mostrar indicador de clique DEPOIS que a carta terminar de aparecer
    masterTimeline.to(
      this.clickIndicator,
      {
        duration: this.isMobile ? 1 : 1.5,
        opacity: 0.9,
        scale: 1,
        ease: "power1.out",
        force3D: true,
      },
      this.isMobile ? "+=0.5" : "+=0.8" // Delay menor em mobile
    );
  }

  setup3DHoverAnimation() {
    if (!this.cartaElement || !this.cartaImage) return;

    // Otimizações para mobile: reduzir duração e complexidade
    const duration = this.isMobile ? 0.6 : 1;
    const maxRotation = this.isMobile ? 8 : 15;
    const maxDepth = this.isMobile ? 50 : 100;
    const useFilters = !this.isMobile; // Desabilitar filtros em mobile para melhor performance

    // Cursor-driven perspective tilt usando GSAP quickTo (referência: https://demos.gsap.com/demo/cursor-driven-perspective-tilt)
    const xTo = gsap.quickTo(this.cartaElement, "rotationY", {
      duration: duration,
      ease: this.isMobile ? "power2.out" : "power3.out", // Easing mais simples em mobile
    });
    const yTo = gsap.quickTo(this.cartaElement, "rotationX", {
      duration: duration,
      ease: this.isMobile ? "power2.out" : "power3.out",
    });
    const zTo = gsap.quickTo(this.cartaElement, "z", {
      duration: duration,
      ease: this.isMobile ? "power2.out" : "power3.out",
    });

    // Calcular centro da carta (com cache para mobile)
    let cachedCenter = { x: 0, y: 0 };
    let centerUpdateTime = 0;
    const updateCenter = () => {
      const now = Date.now();
      // Cache por 100ms em mobile para reduzir cálculos
      if (!this.isMobile || now - centerUpdateTime > 100) {
        const rect = this.cartaElement.getBoundingClientRect();
        cachedCenter.x = rect.left + rect.width / 2;
        cachedCenter.y = rect.top + rect.height / 2;
        this.centerX = cachedCenter.x;
        this.centerY = cachedCenter.y;
        centerUpdateTime = now;
      } else {
        this.centerX = cachedCenter.x;
        this.centerY = cachedCenter.y;
      }
    };

    updateCenter();

    // Throttle resize em mobile
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCenter, this.isMobile ? 200 : 100);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Rastrear cursor/touch
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isAnimating = false;
    let animationFrameId = null;

    // Throttle mousemove em mobile (reduzir frequência de eventos)
    let lastMoveTime = 0;
    const moveThrottle = this.isMobile ? 16 : 0; // ~60fps em mobile, sem throttle em desktop

    if (!this.isMobile) {
      // Desktop: rastrear mouse
      document.addEventListener(
        "mousemove",
        (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;

          if (!isAnimating) {
            isAnimating = true;
            animate();
          }
        },
        { passive: true }
      );

      // Mouse leave - Resetar suavemente
      this.cartaElement.addEventListener(
        "mouseleave",
        () => {
          xTo(0);
          yTo(0);
          zTo(-200);

          if (useFilters && this.cartaImage) {
            gsap.to(this.cartaImage, {
              duration: 0.8,
              filter:
                "brightness(1) drop-shadow(0 25px 70px rgba(0, 0, 0, 0.5))",
              ease: "power1.out",
            });
          }
        },
        { passive: true }
      );
    }

    // Animação otimizada usando requestAnimationFrame
    const animate = () => {
      const now = Date.now();

      // Throttle em mobile para reduzir carga
      if (this.isMobile && now - lastMoveTime < moveThrottle) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastMoveTime = now;

      updateCenter();

      // Calcular posição relativa
      const relX = mouseX - this.centerX;
      const relY = mouseY - this.centerY;

      // Normalizar valores (-1 a 1)
      const halfWidth = Math.max(this.cartaElement.offsetWidth / 2, 1);
      const halfHeight = Math.max(this.cartaElement.offsetHeight / 2, 1);
      const normalizedX = relX / halfWidth;
      const normalizedY = relY / halfHeight;

      // Limitar valores
      const clampedX = Math.max(-1, Math.min(1, normalizedX));
      const clampedY = Math.max(-1, Math.min(1, normalizedY));

      // Calcular rotações
      const targetX = clampedX * maxRotation;
      const targetY = -clampedY * maxRotation;

      // Aplicar rotações com quickTo
      xTo(targetX);
      yTo(targetY);

      // Calcular profundidade (simplificado em mobile)
      if (!this.isMobile) {
        const distance = Math.sqrt(clampedX ** 2 + clampedY ** 2);
        const depth = -200 - distance * maxDepth;
        zTo(depth);
      }

      // Efeito de brilho apenas em desktop (filtros são custosos em mobile)
      if (useFilters && this.cartaImage) {
        const brightness = 1 + Math.abs(clampedX) * 0.03;
        gsap.to(this.cartaImage, {
          duration: 0.3,
          filter: `brightness(${brightness}) drop-shadow(0 ${
            25 + Math.sqrt(clampedX ** 2 + clampedY ** 2) * 5
          }px ${
            70 + Math.sqrt(clampedX ** 2 + clampedY ** 2) * 10
          }px rgba(0, 0, 0, ${
            0.5 + Math.sqrt(clampedX ** 2 + clampedY ** 2) * 0.1
          }))`,
          ease: "power1.out",
        });
      }

      // Continuar animação
      animationFrameId = requestAnimationFrame(animate);
    };

    // Touch devices - Otimizado para mobile
    if (this.isMobile) {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchActive = false;

      const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchActive = true;
          updateCenter();

          if (!isAnimating) {
            isAnimating = true;
            animate();
          }
        }
      };

      const handleTouchMove = (e) => {
        if (e.touches.length === 1 && touchActive) {
          mouseX = e.touches[0].clientX;
          mouseY = e.touches[0].clientY;
        }
      };

      const handleTouchEnd = () => {
        touchActive = false;
        // Resetar após delay
        setTimeout(() => {
          if (!touchActive) {
            xTo(0);
            yTo(0);
            zTo(-200);
          }
        }, 200);
      };

      this.cartaElement.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      this.cartaElement.addEventListener("touchmove", handleTouchMove, {
        passive: true,
      });
      this.cartaElement.addEventListener("touchend", handleTouchEnd, {
        passive: true,
      });
    }

    // Iniciar animação quando a carta estiver visível
    setTimeout(() => {
      if (!isAnimating) {
        isAnimating = true;
        animate();
      }
    }, 1000);
  }

  setupClickIndicatorAnimation() {
    if (!this.clickIndicator) return;

    // Animação de pulso otimizada para mobile
    const duration = this.isMobile ? 1.5 : 2;
    const scale = this.isMobile ? 1.08 : 1.1; // Menor escala em mobile

    const pulseAnimation = gsap.timeline({ repeat: -1 });
    pulseAnimation
      .to(this.clickIndicator, {
        duration: duration,
        scale: scale,
        ease: "sine.inOut",
        force3D: true, // Aceleração GPU
      })
      .to(this.clickIndicator, {
        duration: duration,
        scale: 1,
        ease: "sine.inOut",
        force3D: true,
      });
  }

  // setupBrilhoEffect removido - removendo animação de piscar da carta para manter elegância

  setupInteractions() {
    if (!this.cartaElement) return;

    // Feedback visual ao tocar (mobile)
    this.cartaElement.addEventListener("touchstart", () => {
      gsap.to(this.cartaElement, {
        duration: 0.4,
        scale: 0.98,
        z: -250,
        ease: "power1.out",
      });
    });

    this.cartaElement.addEventListener("touchend", () => {
      gsap.to(this.cartaElement, {
        duration: 0.6,
        scale: 1,
        z: -200,
        ease: "power1.out",
      });
    });

    // Prevenir zoom no double tap
    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      },
      false
    );

    // Clique para abrir
    this.cartaElement.addEventListener("click", () => {
      this.abrirConvite();
    });
  }

  abrirConvite() {
    if (!this.cartaElement || !this.logoExpansion || !this.brilhoTransition)
      return;

    const openTimeline = gsap.timeline();

    // 1. Esconder indicador de clique
    openTimeline.to(this.clickIndicator, {
      duration: 0.3,
      opacity: 0,
      scale: 0.5,
      ease: "power1.in",
    });

    // 2. Esmaecer background enquanto logo se aproxima
    openTimeline.to(
      this.backgroundOverlay,
      {
        duration: 0.6,
        opacity: 0.7,
        ease: "power2.out",
      },
      "-=0.1"
    );

    // 3. Carta se afasta suavemente com rotação elegante
    openTimeline.to(
      this.cartaElement,
      {
        duration: 0.9,
        scale: 0.6,
        opacity: 0.3,
        z: -600,
        rotationY: 15,
        rotationX: -10,
        ease: "power2.in",
      },
      "-=0.3"
    );

    // 4. Logo aparece com rotação e movimento elegante
    openTimeline
      .to(
        this.logoExpansion,
        {
          duration: 0.4,
          opacity: 1,
          scale: 0.4,
          z: -800,
          rotationY: -20,
          rotationX: 10,
          ease: "power3.out",
        },
        "-=0.5"
      )
      // Logo se aproxima com rotação suave e expansão
      .to(
        this.logoExpansion,
        {
          duration: 1.5,
          scale: 4,
          z: 600,
          rotationY: 0,
          rotationX: 0,
          ease: "power2.inOut",
        },
        "-=0.2"
      )
      // Brilho elegante no logo durante aproximação - apenas rosa (sem amarelo)
      .to(
        this.logoImage,
        {
          duration: 1.5,
          filter:
            "brightness(1.6) drop-shadow(0 0 100px rgba(255, 192, 203, 0.8)) drop-shadow(0 0 150px rgba(255, 105, 180, 0.6))",
          ease: "power2.inOut",
        },
        "-=1.5"
      );

    // 5. Transição com brilho INTENSO
    openTimeline
      .to(
        this.brilhoTransition,
        {
          duration: 0.6,
          opacity: 1,
          scale: 1.8,
          ease: "power2.inOut",
        },
        "-=0.4"
      )
      .to(
        this.logoExpansion,
        {
          duration: 0.6,
          opacity: 0,
          scale: 5,
          z: 1000,
          rotationY: 10,
          ease: "power2.in",
        },
        "-=0.3"
      )
      .to(
        this.brilhoTransition,
        {
          duration: 2,
          opacity: 0,
          scale: 2.5,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .to(
        this.backgroundOverlay,
        {
          duration: 1,
          opacity: 0,
          ease: "power2.out",
        },
        "-=1.5"
      )
      .call(() => {
        this.iniciarVideo();
      });
  }

  iniciarVideo() {
    if (!this.videoFullscreen || !this.conviteVideo) return;

    const container = this.containerElement;
    const background = this.backgroundElement;

    const video = this.conviteVideo;
    const videoTimeline = gsap.timeline({
      onComplete: () => {
        this.videoFullscreen.classList.add("is-visible");
        video.play().catch(() => {});
        // Transição começa antes do fim: apagão inicia ~2.5s antes do vídeo terminar
        const startFadeBeforeEnd = 2.5;
        const onTimeUpdate = () => {
          if (video.duration && !isNaN(video.duration) && video.currentTime >= video.duration - startFadeBeforeEnd) {
            video.removeEventListener("timeupdate", onTimeUpdate);
            this.aoFimDoVideo();
          }
        };
        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("ended", () => {
          video.removeEventListener("timeupdate", onTimeUpdate);
          if (!this._fadeStarted) this.aoFimDoVideo();
        }, { once: true });
      },
    });

    // 1. Apagar a imagem: fade out do container e do background
    if (container) {
      videoTimeline.to(container, {
        duration: 0.6,
        opacity: 0,
        ease: "power2.in",
      });
    }
    if (background) {
      videoTimeline.to(
        background,
        {
          duration: 0.6,
          opacity: 0,
          ease: "power2.in",
        },
        container ? "-=0.6" : 0
      );
    }
    if (container) videoTimeline.set(container, { visibility: "hidden" });
    if (background) videoTimeline.set(background, { visibility: "hidden" });

    // 2. Vídeo em tela cheia: mostrar e fade in
    videoTimeline
      .set(this.videoFullscreen, { visibility: "visible", opacity: 0 })
      .to(this.videoFullscreen, {
        duration: 0.8,
        opacity: 1,
        ease: "power2.out",
      });
  }

  aoFimDoVideo() {
    if (this._fadeStarted) return;
    this._fadeStarted = true;
    if (!this.videoFadeOverlay || typeof gsap === "undefined") {
      window.location.href = "convite.html";
      return;
    }
    // Apagão: escurece até preto, mantém um instante, depois muda de página
    gsap.to(this.videoFadeOverlay, {
      duration: 1.4,
      opacity: 1,
      ease: "power2.in",
      onComplete: () => {
        gsap.delayedCall(0.35, () => {
          window.location.href = "convite.html";
        });
      },
    });
  }

  reiniciar() {
    this.setupInitialStates();
    setTimeout(() => {
      this.setupSmoothEntrance();
    }, 300);
  }
}

// Inicializar quando o DOM, CONFIG e GSAP estiverem prontos
let animationManager;

function initAnimations() {
  if (
    window.CONVITE_CONFIG &&
    typeof gsap !== "undefined" &&
    document.getElementById("carta") &&
    document.getElementById("clickIndicator")
  ) {
    animationManager = new AnimationManager(window.CONVITE_CONFIG);
    window.animationManager = animationManager;
  } else {
    setTimeout(initAnimations, 100);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAnimations);
} else {
  initAnimations();
}
