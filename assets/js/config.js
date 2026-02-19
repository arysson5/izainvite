/* ============================================
   CONFIGURAÇÕES CENTRALIZADAS DO CONVITE
   Estilo Victoria's Secret - Elegante e Luxuoso
   Animações Suaves e Elegantes
   ============================================ */

const CONVITE_CONFIG = {
  carta: {
    // Tamanhos - Ocupando toda a tela
    width: {
      mobile: "100vw",
      tablet: "100vw",
      desktop: "100vw",
    },
    height: {
      mobile: "100vh",
      tablet: "100vh",
      desktop: "100vh",
    },
    aspectRatio: "auto",
    maxWidth: "100vw",
    maxHeight: "100vh",
  },

  background: {
    // Cores do gradiente elegante
    gradient: {
      color1: "#0a0508",
      color2: "#1a0f1a",
      color3: "#2d1b2e",
      color4: "#1a0f1a",
      color5: "#0a0508",
      angle: "180deg",
    },

    // Efeito bokeh melhorado - mais sutil
    bokeh: {
      count: 6,
      colors: [
        {
          primary: "rgba(255, 192, 203, 0.6)",
          secondary: "rgba(255, 105, 180, 0.2)",
        },
        {
          primary: "rgba(255, 215, 0, 0.5)",
          secondary: "rgba(255, 165, 0, 0.2)",
        },
        {
          primary: "rgba(255, 20, 147, 0.5)",
          secondary: "rgba(199, 21, 133, 0.2)",
        },
        {
          primary: "rgba(255, 215, 0, 0.4)",
          secondary: "rgba(218, 165, 32, 0.2)",
        },
        {
          primary: "rgba(255, 182, 193, 0.5)",
          secondary: "rgba(255, 105, 180, 0.2)",
        },
        {
          primary: "rgba(255, 192, 203, 0.4)",
          secondary: "rgba(255, 20, 147, 0.15)",
        },
      ],
      sizes: [200, 150, 180, 120, 160, 140],
      animationDuration: 30,
      opacity: 0.4,
    },
  },

  // Partículas elegantes (estilo Victoria's Secret)
  particles: {
    enabled: true,
    count: 25,
    colors: ["#ffd700", "#ffc0cb", "#ff69b4", "#ffb6c1"],
    speed: {
      min: 0.3,
      max: 1.5,
    },
    size: {
      min: 2,
      max: 5,
    },
  },

  animations: {
    // Animação de entrada MUITO SUAVE e elegante
    entrada: {
      duration: 4, // Mais lento e suave
      ease: "power1.out", // Easing muito suave
      depth: -3000,
      stagger: 0.4,
    },
    // Animação de logo (não usado mais, mas mantido)
    logo: {
      duration: 2,
      ease: "power1.out",
      delay: 2.5,
    },
    // Pulsação muito suave
    pulsacao: {
      duration: 6, // Mais lento
      scale: 1.02, // Mais sutil
      ease: "sine.inOut", // Easing suave
    },
    // Abertura elegante
    abertura: {
      duration: 1.5, // Mais suave
      ease: "power1.inOut",
    },
    // Efeitos de brilho
    brilho: {
      duration: 5, // Mais lento
      intensity: 0.2,
    },
  },
};

// Exportar para uso global
window.CONVITE_CONFIG = CONVITE_CONFIG;
