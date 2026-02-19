/* ============================================
   GERENCIADOR DO BACKGROUND
   Estilo Victoria's Secret - Elegante
   Movimentos sutis e elegantes com GSAP
   ============================================ */

class BackgroundManager {
  constructor(config) {
    this.config = config.background;
    this.container = document.getElementById("background");
    this.bokehs = [];
    this.init();
  }

  init() {
    if (this.container) {
      this.createBokeh();
      this.animateBokeh();
    }
  }

  createBokeh() {
    // Limpar bokehs existentes
    this.container.innerHTML = "";
    this.bokehs = [];

    // Detectar mobile para reduzir número de bokehs (melhor performance)
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      window.innerWidth <= 768 ||
      "ontouchstart" in window;
    const bokehCount = isMobile
      ? Math.floor(this.config.bokeh.count * 0.5)
      : this.config.bokeh.count; // Reduzir 50% em mobile

    for (let i = 0; i < bokehCount; i++) {
      const bokeh = document.createElement("div");
      bokeh.className = "bokeh";

      const color = this.config.bokeh.colors[i];
      const size = this.config.bokeh.sizes[i];

      bokeh.style.width = `${size}px`;
      bokeh.style.height = `${size}px`;
      bokeh.style.background = `radial-gradient(circle, ${color.primary} 0%, ${color.secondary} 50%, transparent 100%)`;
      // Reduzir opacidade para não interferir na imagem de background
      bokeh.style.opacity = this.config.bokeh.opacity * 0.2;
      bokeh.style.setProperty("--size", `${size}px`);

      // Posicionamento elegante e balanceado
      const positions = [
        { top: "5%", left: "15%" },
        { top: "55%", right: "12%" },
        { bottom: "15%", left: "8%" },
        { top: "25%", right: "25%" },
        { bottom: "35%", right: "20%" },
        { top: "70%", left: "30%" },
        { bottom: "60%", left: "45%" },
        { top: "40%", right: "40%" },
      ];

      if (positions[i]) {
        Object.assign(bokeh.style, positions[i]);
      } else {
        // Para bokehs adicionais, posição aleatória mas elegante
        bokeh.style.top = `${Math.random() * 70 + 10}%`;
        bokeh.style.left = `${Math.random() * 70 + 10}%`;
      }

      this.container.appendChild(bokeh);
      this.bokehs.push(bokeh);
    }
  }

  animateBokeh() {
    if (typeof gsap === "undefined" || this.bokehs.length === 0) return;

    // Detectar mobile para otimizações
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      window.innerWidth <= 768 ||
      "ontouchstart" in window;

    // Animações otimizadas para mobile
    this.bokehs.forEach((bokeh, index) => {
      const delay = index * (isMobile ? 1.2 : 0.8); // Delay maior em mobile
      const duration = isMobile
        ? 25 + Math.random() * 10
        : 20 + Math.random() * 15; // Mais lento em mobile
      const movement = isMobile
        ? 10 + Math.random() * 5
        : 15 + Math.random() * 10; // Menos movimento em mobile

      // Animação otimizada (menos propriedades animadas em mobile)
      const animationProps = {
        x: `+=${(Math.random() - 0.5) * movement}`,
        y: `+=${(Math.random() - 0.5) * movement}`,
        duration: duration,
        ease: "sine.inOut",
        delay: delay,
        repeat: -1,
        yoyo: true,
        force3D: true, // Aceleração GPU
      };

      // Em mobile, reduzir animações de scale e rotation (mais custosas)
      if (!isMobile) {
        animationProps.scale = 1 + Math.random() * 0.1;
        animationProps.rotation = (Math.random() - 0.5) * 5;
      }

      animationProps.opacity = isMobile
        ? 0.05 + Math.random() * 0.05
        : 0.1 + Math.random() * 0.1;

      gsap.to(bokeh, animationProps);
    });
  }

  applyGradient() {
    const root = document.documentElement;
    root.style.setProperty("--bg-gradient-color1", this.config.gradient.color1);
    root.style.setProperty("--bg-gradient-color2", this.config.gradient.color2);
    root.style.setProperty("--bg-gradient-color3", this.config.gradient.color3);
    root.style.setProperty("--bg-gradient-angle", this.config.gradient.angle);
  }

  // Método para ajustar intensidade do bokeh
  setBokehIntensity(intensity) {
    this.bokehs.forEach((bokeh) => {
      gsap.to(bokeh, {
        opacity: intensity * 0.2,
        duration: 1,
        ease: "power2.inOut",
      });
    });
    this.config.bokeh.opacity = intensity;
  }
}

// Inicializar quando o DOM e CONFIG estiverem prontos
let backgroundManager;

function initBackground() {
  if (window.CONVITE_CONFIG && document.getElementById("background")) {
    backgroundManager = new BackgroundManager(window.CONVITE_CONFIG);
    window.backgroundManager = backgroundManager;
  } else {
    // Tentar novamente se ainda não estiver pronto
    setTimeout(initBackground, 50);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBackground);
} else {
  initBackground();
}
