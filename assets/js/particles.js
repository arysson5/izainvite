/* ============================================
   SISTEMA DE PARTÍCULAS ELEGANTES
   Estilo Victoria's Secret
   ============================================ */

class ParticlesManager {
  constructor(config) {
    this.config = config.particles;
    this.container = null;
    this.particles = [];
    this.animationId = null;
    this.init();
  }

  init() {
    if (!this.config.enabled) return;

    // Criar container de partículas
    this.container = document.createElement("div");
    this.container.className = "particles-container";
    this.container.id = "particlesContainer";
    document.body.appendChild(this.container);

    this.createParticles();
    this.animate();
  }

  createParticles() {
    // Detectar mobile para reduzir partículas (melhor performance)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768 ||
                     ('ontouchstart' in window);
    const particleCount = isMobile ? Math.floor(this.config.count * 0.4) : this.config.count; // Reduzir 60% em mobile

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Tamanho aleatório
      const size =
        Math.random() * (this.config.size.max - this.config.size.min) +
        this.config.size.min;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Cor aleatória
      const color =
        this.config.colors[
          Math.floor(Math.random() * this.config.colors.length)
        ];
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

      // Posição inicial aleatória
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${100 + Math.random() * 20}%`;

      // Delay de animação
      const delay = Math.random() * 5;
      particle.style.animationDelay = `${delay}s`;

      // Velocidade aleatória
      const speed =
        Math.random() * (this.config.speed.max - this.config.speed.min) +
        this.config.speed.min;
      particle.dataset.speed = speed;

      this.container.appendChild(particle);
      this.particles.push(particle);
    }
  }

  animate() {
    this.particles.forEach((particle, index) => {
      const speed = parseFloat(particle.dataset.speed);
      const currentTop = parseFloat(particle.style.top) || 100;
      const newTop = currentTop - speed;

      // Resetar quando sair da tela
      if (newTop < -10) {
        particle.style.top = `${100 + Math.random() * 20}%`;
        particle.style.left = `${Math.random() * 100}%`;
      } else {
        particle.style.top = `${newTop}%`;
      }

      // Movimento horizontal suave
      const currentLeft = parseFloat(particle.style.left) || 50;
      const drift = Math.sin(Date.now() / 1000 + index) * 0.5;
      particle.style.left = `${currentLeft + drift}%`;

      // Opacidade baseada na posição
      const opacity = Math.max(0, Math.min(1, (100 - newTop) / 50));
      particle.style.opacity = opacity;
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.container) {
      this.container.remove();
    }
  }
}

// Inicializar quando o CONFIG estiver pronto
let particlesManager;

function initParticles() {
  if (window.CONVITE_CONFIG && window.CONVITE_CONFIG.particles) {
    particlesManager = new ParticlesManager(window.CONVITE_CONFIG);
    window.particlesManager = particlesManager;
  } else {
    setTimeout(initParticles, 50);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initParticles);
} else {
  initParticles();
}
