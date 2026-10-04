(function () {
  var arquivoEl = document.getElementById("arquivo");
  var codigoEl = document.getElementById("codigo");
  var elementoEl = document.getElementById("elemento");

  function linha(texto, ativa) {
    return '<span class="ln' + (ativa ? " on" : "") + '">' + texto + "</span>";
  }

  var passos = {
    abertura: { elemento: "", arquivo: "", codigo: "" },
    codigo: {
      elemento: "O código",
      arquivo: "index.html",
      codigo: [
        linha("&lt;<span class=\"tok-tag\">div</span> <span class=\"tok-attr\">class</span>=<span class=\"tok-str\">\"carta\"</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"carta\"</span>&gt;", true),
        linha("  &lt;<span class=\"tok-tag\">img</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"cartaImage\"</span>"),
        linha("    <span class=\"tok-attr\">alt</span>=<span class=\"tok-str\">\"Carta do convite\"</span> /&gt;"),
        linha("&lt;/<span class=\"tok-tag\">div</span>&gt;"),
        linha(""),
        linha("&lt;<span class=\"tok-tag\">div</span> <span class=\"tok-attr\">class</span>=<span class=\"tok-str\">\"click-indicator\"</span>&gt;"),
        linha("  &lt;<span class=\"tok-tag\">img</span> <span class=\"tok-attr\">alt</span>=<span class=\"tok-str\">\"Toque para abrir\"</span> /&gt;"),
        linha("&lt;/<span class=\"tok-tag\">div</span>&gt;"),
      ].join(""),
    },
    convite: {
      elemento: "O convite",
      arquivo: "index.html",
      codigo: null,
    },
    toque: {
      elemento: "O toque",
      arquivo: "animations.js",
      codigo: [
        linha("<span class=\"tok-key\">this</span>.cartaElement.<span class=\"tok-fn\">addEventListener</span>(<span class=\"tok-str\">\"click\"</span>, () =&gt; {", true),
        linha("  <span class=\"tok-key\">this</span>.<span class=\"tok-fn\">abrirConvite</span>();", true),
        linha("});"),
        linha(""),
        linha("<span class=\"tok-fn\">abrirConvite</span>() {"),
        linha("  <span class=\"tok-com\">// a carta se afasta</span>"),
        linha("  <span class=\"tok-com\">// o monograma se aproxima</span>"),
        linha("  <span class=\"tok-key\">this</span>.<span class=\"tok-fn\">iniciarVideo</span>();", true),
        linha("}"),
      ].join(""),
    },
    video: {
      elemento: "O vídeo",
      arquivo: "index.html",
      codigo: [
        linha("&lt;<span class=\"tok-tag\">video</span>", true),
        linha("  <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"conviteVideo\"</span>", true),
        linha("  <span class=\"tok-attr\">src</span>=<span class=\"tok-str\">\"assets/videos/video_final.mp4\"</span>", true),
        linha("  <span class=\"tok-attr\">playsinline</span>"),
        linha("&gt;&lt;/<span class=\"tok-tag\">video</span>&gt;"),
        linha(""),
        linha("<span class=\"tok-key\">video</span>.<span class=\"tok-fn\">play</span>();"),
        linha("<span class=\"tok-com\">// ao fim, o convite abre</span>"),
      ].join(""),
    },
    pagina: {
      elemento: "Você está convidado",
      arquivo: "convite.html",
      codigo: [
        linha("&lt;<span class=\"tok-tag\">p</span> <span class=\"tok-attr\">class</span>=<span class=\"tok-str\">\"convite-subtitulo\"</span>&gt;XV da Iza&lt;/<span class=\"tok-tag\">p</span>&gt;"),
        linha("&lt;<span class=\"tok-tag\">h1</span>&gt;Você Está Convidado(a)&lt;/<span class=\"tok-tag\">h1</span>&gt;", true),
        linha("&lt;<span class=\"tok-tag\">p</span> <span class=\"tok-attr\">class</span>=<span class=\"tok-str\">\"convite-mensagem\"</span>&gt;"),
        linha("  Com grande alegria e emoção..."),
        linha("&lt;/<span class=\"tok-tag\">p</span>&gt;"),
      ].join(""),
    },
    data: {
      elemento: "Data e hora",
      arquivo: "convite.html",
      codigo: [
        linha("&lt;<span class=\"tok-tag\">section</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"conviteSectionData\"</span>&gt;", true),
        linha("  &lt;<span class=\"tok-tag\">span</span>&gt;Data e hora&lt;/<span class=\"tok-tag\">span</span>&gt;"),
        linha("  &lt;<span class=\"tok-tag\">p</span>&gt;09 de maio de 2026 · 19h30&lt;/<span class=\"tok-tag\">p</span>&gt;", true),
        linha("&lt;/<span class=\"tok-tag\">section</span>&gt;"),
      ].join(""),
    },
    local: {
      elemento: "O local",
      arquivo: "convite.html",
      codigo: [
        linha("&lt;<span class=\"tok-tag\">section</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"conviteSectionLocal\"</span>&gt;", true),
        linha("  &lt;<span class=\"tok-tag\">span</span>&gt;Local&lt;/<span class=\"tok-tag\">span</span>&gt;"),
        linha("  &lt;<span class=\"tok-tag\">p</span>&gt;Espaço Melvalen&lt;/<span class=\"tok-tag\">p</span>&gt;", true),
        linha("  &lt;<span class=\"tok-tag\">iframe</span> <span class=\"tok-attr\">title</span>=<span class=\"tok-str\">\"Local do evento\"</span>&gt;&lt;/<span class=\"tok-tag\">iframe</span>&gt;"),
        linha("&lt;/<span class=\"tok-tag\">section</span>&gt;"),
      ].join(""),
    },
    traje: {
      elemento: "O traje",
      arquivo: "convite.html",
      codigo: [
        linha("&lt;<span class=\"tok-tag\">section</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"conviteSectionTraje\"</span>&gt;", true),
        linha("  &lt;<span class=\"tok-tag\">span</span>&gt;Sugestão de traje&lt;/<span class=\"tok-tag\">span</span>&gt;"),
        linha("  &lt;<span class=\"tok-tag\">p</span>&gt;Esporte fino&lt;/<span class=\"tok-tag\">p</span>&gt;", true),
        linha("&lt;/<span class=\"tok-tag\">section</span>&gt;"),
      ].join(""),
    },
    contagem: {
      elemento: "A contagem",
      arquivo: "convite.js",
      codigo: [
        linha("<span class=\"tok-key\">const</span> CONVITE_DATE = <span class=\"tok-key\">new</span> <span class=\"tok-fn\">Date</span>(", true),
        linha("  <span class=\"tok-str\">\"2026-05-09T19:30:00\"</span>", true),
        linha(");"),
        linha(""),
        linha("<span class=\"tok-key\">const</span> days = Math.<span class=\"tok-fn\">floor</span>(totalSeconds / 86400);"),
        linha("elDays.textContent = String(days);"),
      ].join(""),
    },
    presente: {
      elemento: "Sugestão de presente",
      arquivo: "convite.html",
      codigo: [
        linha("&lt;<span class=\"tok-tag\">a</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"btnSugestaoPresente\"</span>&gt;", true),
        linha("  &lt;<span class=\"tok-tag\">span</span>&gt;Sugestão de presente&lt;/<span class=\"tok-tag\">span</span>&gt;"),
        linha("  &lt;<span class=\"tok-tag\">span</span>&gt;Veja nossa lista de preferências&lt;/<span class=\"tok-tag\">span</span>&gt;"),
        linha("&lt;/<span class=\"tok-tag\">a</span>&gt;"),
      ].join(""),
    },
    pix: {
      elemento: "PIX",
      arquivo: "convite.html",
      codigo: [
        linha("&lt;<span class=\"tok-tag\">a</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"btnPix\"</span>&gt;PIX&lt;/<span class=\"tok-tag\">a</span>&gt;", true),
        linha("&lt;<span class=\"tok-tag\">p</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"pixKey\"</span>&gt;&lt;/<span class=\"tok-tag\">p</span>&gt;"),
        linha("&lt;<span class=\"tok-tag\">button</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"btnCopyPix\"</span>&gt;"),
        linha("  Copiar chave"),
        linha("&lt;/<span class=\"tok-tag\">button</span>&gt;"),
      ].join(""),
    },
    form: {
      elemento: "Confirmar presença",
      arquivo: "convite.html",
      codigo: [
        linha("&lt;<span class=\"tok-tag\">select</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"confirmarPresenca\"</span>&gt;", true),
        linha("  &lt;<span class=\"tok-tag\">option</span>&gt;Comparecerei&lt;/<span class=\"tok-tag\">option</span>&gt;"),
        linha("  &lt;<span class=\"tok-tag\">option</span>&gt;Não poderei ir&lt;/<span class=\"tok-tag\">option</span>&gt;"),
        linha("  &lt;<span class=\"tok-tag\">option</span>&gt;Levarei um acompanhante&lt;/<span class=\"tok-tag\">option</span>&gt;"),
        linha("&lt;/<span class=\"tok-tag\">select</span>&gt;"),
        linha("&lt;<span class=\"tok-tag\">input</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"confirmarNome\"</span> /&gt;", true),
        linha("&lt;<span class=\"tok-tag\">button</span> <span class=\"tok-attr\">id</span>=<span class=\"tok-str\">\"btnEnviarConfirmacao\"</span>&gt;"),
        linha("  Enviar confirmação"),
        linha("&lt;/<span class=\"tok-tag\">button</span>&gt;"),
      ].join(""),
    },
    gestao: {
      elemento: "A gestão",
      arquivo: "gestao.html",
      codigo: [
        linha("<span class=\"tok-fn\">fetch</span>(<span class=\"tok-str\">\"/api/convidados\"</span>)", true),
        linha("  .<span class=\"tok-fn\">then</span>((data) =&gt; {"),
        linha("    <span class=\"tok-fn\">renderTotais</span>(data.totais);", true),
        linha("    <span class=\"tok-fn\">renderNaoVao</span>(data.convidados);"),
        linha("    <span class=\"tok-fn\">renderTabela</span>(data.convidados);", true),
        linha("  });"),
      ].join(""),
    },
  };

  passos.convite.codigo = passos.codigo.codigo;

  window.mostrarPasso = function (id) {
    var passo = passos[id];
    if (!passo) return;
    document.body.dataset.passo = id;
    elementoEl.classList.add("is-trocando");
    window.setTimeout(function () {
      elementoEl.textContent = passo.elemento;
      elementoEl.classList.remove("is-trocando");
    }, 180);
    if (passo.arquivo) arquivoEl.textContent = passo.arquivo;
    if (passo.codigo) codigoEl.innerHTML = passo.codigo;
  };
})();
