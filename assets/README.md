# Arquitetura Modular do Convite

Esta pasta contém a estrutura modular do projeto de convite.

## Estrutura de Pastas

```
assets/
├── css/           # Estilos modulares
├── js/            # JavaScript modular
└── images/        # Imagens organizadas
    ├── carta/     # Elementos do convite
    └── background/ # Elementos de background
```

## Arquivos CSS

- **config.css**: Variáveis CSS e configurações globais
- **background.css**: Estilos do background e efeito bokeh
- **carta.css**: Estilos da carta/convite
- **animations.css**: Animações e efeitos visuais

## Arquivos JavaScript

- **config.js**: Configurações centralizadas (CONVITE_CONFIG)
- **background.js**: Gerenciador do background (BackgroundManager)
- **carta.js**: Gerenciador da carta (CartaManager)
- **animations.js**: Gerenciador de animações GSAP (AnimationManager)

## Como Usar

### Ajustar Tamanho da Carta

```javascript
// Aumentar tamanho em 20%
cartaManager.setSize(1.2);

// Voltar ao tamanho normal
cartaManager.setSize(1);
```

### Ajustar Posição

```javascript
// Mover carta
cartaManager.setPosition(50, -30, 100);

// Resetar posição
cartaManager.resetPosition();
```

### Ajustar Background

```javascript
// Ajustar intensidade do bokeh
backgroundManager.setBokehIntensity(0.8);

// Adicionar mais bokehs
backgroundManager.addBokeh(3);
```

### Reiniciar Animações

```javascript
// Reiniciar animação de entrada
animationManager.reiniciar();
```

## Configurações

Todas as configurações estão centralizadas em `config.js`. Edite o objeto `CONVITE_CONFIG` para ajustar:

- Tamanhos da carta
- Cores do background
- Configurações de animação
- Efeitos bokeh

## Adicionar Elementos Modulares

Para separar a imagem em camadas modulares:

1. Coloque as imagens em `assets/images/carta/`
2. Descomente as camadas no HTML
3. Ajuste as posições via CSS ou JavaScript
