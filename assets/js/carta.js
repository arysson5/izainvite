/* ============================================
   GERENCIADOR DA CARTA
   ============================================ */

class CartaManager {
  constructor(config) {
    this.config = config.carta;
    this.element = document.getElementById("carta");
    this.init();
  }

  init() {
    if (this.element) {
      this.applyStyles();
      this.setupResponsive();
    }
  }

  applyStyles() {
    const root = document.documentElement;
    root.style.setProperty(
      "--carta-width-mobile",
      this.config.width.mobile
    );
    root.style.setProperty("--carta-width-tablet", this.config.width.tablet);
    root.style.setProperty("--carta-width-desktop", this.config.width.desktop);
    root.style.setProperty("--carta-max-width", this.config.maxWidth);
    root.style.setProperty("--carta-max-height", this.config.maxHeight || "100vh");
    root.style.setProperty("--carta-aspect-ratio", this.config.aspectRatio);
    root.style.setProperty(
      "--carta-shadow-color",
      this.config.shadow.color
    );
    root.style.setProperty("--carta-shadow-blur", this.config.shadow.blur);
    root.style.setProperty(
      "--carta-shadow-spread",
      this.config.shadow.spread
    );
  }

  // Método para ajustar tamanho dinamicamente
  setSize(size) {
    this.config.scale.final = size;
    if (this.element) {
      gsap.to(this.element, {
        scale: size,
        duration: 0.5,
      });
    }
  }

  // Método para ajustar posição
  setPosition(x, y, z = 0) {
    if (this.element) {
      gsap.to(this.element, {
        x: x,
        y: y,
        z: z,
        duration: 0.5,
      });
      this.config.position.x = x;
      this.config.position.y = y;
      this.config.position.z = z;
    }
  }

  // Método para resetar posição
  resetPosition() {
    this.setPosition(0, 0, 0);
  }

  setupResponsive() {
    const updateSize = () => {
      if (!this.element) return;

      // Sempre ocupar 100% da tela
      this.element.style.width = "100vw";
      this.element.style.height = "100vh";
      this.element.style.maxWidth = "100vw";
      this.element.style.maxHeight = "100vh";
    };

    window.addEventListener("resize", updateSize);
    updateSize();
  }

  // Método para obter dimensões atuais
  getDimensions() {
    if (this.element) {
      const rect = this.element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
      };
    }
    return null;
  }
}

// Inicializar quando o DOM e CONFIG estiverem prontos
let cartaManager;

function initCarta() {
  if (window.CONVITE_CONFIG && document.getElementById("carta")) {
    cartaManager = new CartaManager(window.CONVITE_CONFIG);
    window.cartaManager = cartaManager;
  } else {
    // Tentar novamente se ainda não estiver pronto
    setTimeout(initCarta, 50);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCarta);
} else {
  initCarta();
}
