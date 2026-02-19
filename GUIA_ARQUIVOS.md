# Guia de Arquivos para o Convite Elegante

## 📁 Estrutura de Arquivos na Pasta `media/`

Para que a animação funcione perfeitamente com elementos separados, você precisa ter os seguintes arquivos na pasta `media/`:

### Arquivos Necessários:

1. **`background.png`** - Fundo/base do convite

   - Primeira camada a aparecer
   - Deve conter o fundo/estrutura base do convite

2. **`carta.png`** - Carta principal do convite

   - Segunda camada a aparecer
   - Deve conter o design principal da carta

3. **`logo.png`** - Logo/emblema do convite
   - Última camada a aparecer (com animação especial)
   - Deve conter o logo ou elemento principal decorativo

### Fallback Automático

Se algum arquivo não for encontrado:

- `background.png` e `carta.png` → Usam a imagem completa original
- `logo.png` → Simplesmente não aparece (não quebra a animação)

## 🎨 Como Separar a Imagem

### Opção 1: Usando Photoshop/GIMP

1. Abra a imagem original
2. Crie 3 camadas separadas:
   - **Background**: Fundo/base
   - **Carta**: Design principal
   - **Logo**: Elemento decorativo principal
3. Exporte cada camada como PNG com transparência

### Opção 2: Usando Ferramentas Online

- Remove.bg (para remover fundos)
- Photopea.com (editor online gratuito)
- Canva (com camadas)

## ✨ Características da Animação

### Sequência de Aparição (Estilo Victoria's Secret):

1. **Background** (0s)

   - Aparece suavemente do fundo
   - Escala de 0.8 → 1.0
   - Opacidade 0 → 1

2. **Carta Principal** (0.3s depois)

   - Aparece com movimento elegante
   - Mesma animação suave

3. **Logo** (2.5s depois)

   - Aparece com rotação e escala
   - Animação elástica especial
   - Último elemento a aparecer

4. **Partículas** (durante toda a animação)

   - 30 partículas douradas e rosas
   - Flutuam suavemente pela tela

5. **Bokeh Background** (8 elementos)
   - Luzes flutuantes elegantes
   - Movimento orgânico contínuo

## 🎯 Personalização

### Ajustar Velocidade das Animações

Edite `assets/js/config.js`:

```javascript
animations: {
  entrada: {
    duration: 3.5,  // Duração total (segundos)
    stagger: 0.3,   // Delay entre camadas
  },
  logo: {
    duration: 2,    // Duração da logo
    delay: 2.5,     // Delay antes de aparecer
  }
}
```

### Ajustar Partículas

```javascript
particles: {
  enabled: true,
  count: 30,        // Número de partículas
  colors: ["#ffd700", "#ffc0cb", "#ff69b4"],
  speed: {
    min: 0.5,
    max: 2,
  }
}
```

## 📱 Compatibilidade

- ✅ Mobile (iOS/Android)
- ✅ Tablet
- ✅ Desktop
- ✅ Todos os navegadores modernos

## 🚀 Performance

- Otimizado para 60fps
- Usa `will-change` para aceleração GPU
- Animações suaves com GSAP
- Partículas leves e eficientes

## 💡 Dicas

1. **Tamanho dos arquivos**: Mantenha cada PNG abaixo de 500KB para melhor performance
2. **Transparência**: Use PNG com canal alpha para efeitos elegantes
3. **Resolução**: 2x a resolução final para telas Retina (ex: 960x1280 para 480x640)
4. **Cores**: Mantenha a paleta dourado/rosa para harmonia visual

## 🐛 Troubleshooting

**Problema**: Imagens não aparecem

- **Solução**: Verifique se os arquivos estão na pasta `media/` com os nomes corretos

**Problema**: Animação muito rápida/lenta

- **Solução**: Ajuste `duration` e `delay` em `config.js`

**Problema**: Partículas não aparecem

- **Solução**: Verifique se `particles.enabled: true` em `config.js`
