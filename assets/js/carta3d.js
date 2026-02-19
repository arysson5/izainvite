/* ============================================
   GERENCIADOR DO MODELO 3D (GLB)
   Integrado com GSAP e animações elegantes
   ============================================ */

class Carta3DManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.container = null;
    this.isLoaded = false;
    this.animationId = null;
    this.init();
  }

  init() {
    if (typeof THREE === "undefined") {
      console.error("Three.js não foi carregado!");
      setTimeout(() => this.init(), 500);
      return;
    }

    this.container = document.getElementById("carta3dContainer");
    if (!this.container) {
      console.error("Container 3D não encontrado!");
      setTimeout(() => this.init(), 500);
      return;
    }

    // Aguardar container ter dimensões
    setTimeout(() => {
      this.setupScene();
      this.loadModel();
      this.animate();
    }, 100);
  }

  setupScene() {
    // Obter dimensões do container
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    // Criar cena
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparente

    // Câmera - Ajustada para melhor visualização
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 8); // Posição inicial mais distante

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Configurações de renderização (compatibilidade)
    if (this.renderer.outputEncoding !== undefined) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    if (this.renderer.toneMapping !== undefined) {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.5;
    }

    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";

    // Iluminação melhorada
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffd700, 1.5);
    directionalLight1.position.set(5, 5, 5);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffc0cb, 1.0);
    directionalLight2.position.set(-5, 3, -5);
    this.scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
    pointLight.position.set(0, 0, 10);
    this.scene.add(pointLight);

    // Resize handler
    window.addEventListener("resize", () => this.onWindowResize());
  }

  loadModel() {
    // Verificar se GLTFLoader está disponível
    if (typeof THREE === "undefined") {
      console.error("Three.js não foi carregado!");
      setTimeout(() => this.loadModel(), 500);
      return;
    }

    // GLTFLoader pode estar em THREE.GLTFLoader ou global
    const GLTFLoader = THREE.GLTFLoader || window.GLTFLoader;
    
    if (!GLTFLoader) {
      console.error("GLTFLoader não está disponível. Aguardando...");
      setTimeout(() => this.loadModel(), 500);
      return;
    }

    const loader = new GLTFLoader();

    loader.load(
      "assets/3d/bolsa clutch 3d model.glb",
      (gltf) => {
        console.log("Modelo GLB carregado:", gltf);
        this.model = gltf.scene;
        
        // Configurar modelo
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Melhorar qualidade de renderização
            if (child.material) {
              child.material.needsUpdate = true;
              // Garantir que materiais sejam visíveis
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.needsUpdate = true;
                });
              }
            }
          }
        });

        // Calcular bounding box e centralizar CORRETAMENTE
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log("Bounding box:", { center, size });

        // Ajustar escala para caber na tela - CÁLCULO MELHORADO
        const maxDim = Math.max(size.x, size.y, size.z);
        const desiredSize = 4; // Tamanho desejado na cena
        const scale = desiredSize / maxDim;
        
        console.log("Escala calculada:", scale);
        
        this.model.scale.set(scale, scale, scale);

        // Centralizar corretamente
        const newCenter = box.getCenter(new THREE.Vector3());
        this.model.position.set(-newCenter.x * scale, -newCenter.y * scale, -newCenter.z * scale);

        // Ajustar câmera para ver o modelo completo
        const distance = maxDim * scale * 2;
        this.camera.position.set(0, 0, distance);
        this.camera.lookAt(0, 0, 0);

        this.scene.add(this.model);
        this.isLoaded = true;

        console.log("Modelo 3D adicionado à cena!");

        // Notificar que o modelo foi carregado
        if (window.onModel3DLoaded) {
          window.onModel3DLoaded(this.model);
        }
      },
      (progress) => {
        if (progress.lengthComputable) {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Carregando modelo 3D: ${percent.toFixed(0)}%`);
        }
      },
      (error) => {
        console.error("Erro ao carregar modelo 3D:", error);
        alert("Erro ao carregar modelo 3D. Verifique o console para mais detalhes.");
      }
    );
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.model && this.isLoaded) {
      // Renderizar
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;

    const rect = this.container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Métodos para integração com GSAP
  getModel() {
    return this.model;
  }

  rotateModel(rotationY, rotationX) {
    if (this.model) {
      gsap.to(this.model.rotation, {
        y: rotationY,
        x: rotationX,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }

  setPosition(x, y, z) {
    if (this.model) {
      gsap.to(this.model.position, {
        x: x,
        y: y,
        z: z,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }

  setScale(scale) {
    if (this.model) {
      gsap.to(this.model.scale, {
        x: scale,
        y: scale,
        z: scale,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }

  setOpacity(opacity) {
    if (this.model) {
      this.model.traverse((child) => {
        if (child.isMesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(material => {
            gsap.to(material, {
              opacity: opacity,
              duration: 0.5,
              ease: "power2.out",
            });
            material.transparent = opacity < 1;
          });
        }
      });
    }
  }

  // Destruir quando necessário
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Inicializar quando Three.js estiver pronto
let carta3DManager;

function initCarta3D() {
  if (typeof THREE !== "undefined" && document.getElementById("carta3dContainer")) {
    carta3DManager = new Carta3DManager();
    window.carta3DManager = carta3DManager;
  } else {
    setTimeout(initCarta3D, 100);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCarta3D);
} else {
  initCarta3D();
}
