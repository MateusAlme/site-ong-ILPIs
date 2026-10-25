/* Movimento Longevo | efeitos e interações da página */
(function () {
  var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navbar, progresso da leitura e barra de doar ---------- */
  var topo = document.querySelector('.topo');
  var botaoTopo = document.getElementById('voltar-topo');
  var barraDoar = document.getElementById('barra-doar');
  var toggle = document.getElementById('menu-toggle');
  var hero = document.querySelector('.hero');
  var ultimoY = window.scrollY;
  var zonasSemBarra = 0; /* quantas áreas de doação/contato estão na tela */

  function aoRolar() {
    var y = window.scrollY;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    topo.classList.toggle('solido', y > 60);
    topo.classList.toggle('escondido', y > 400 && y > ultimoY && !toggle.checked);
    botaoTopo.classList.toggle('visivel', y > 700);
    botaoTopo.style.setProperty('--lido', total > 0 ? Math.min(y / total, 1) : 0);
    barraDoar.classList.toggle('visivel', y > hero.offsetHeight * 0.8 && zonasSemBarra === 0);
    ultimoY = y;
  }
  window.addEventListener('scroll', aoRolar, { passive: true });

  /* A barra de doar some quando a própria seção de doação, o contato ou o rodapé aparecem */
  var obsZonas = new IntersectionObserver(function (itens) {
    itens.forEach(function (i) {
      if (i.target._naTela !== i.isIntersecting) {
        zonasSemBarra += i.isIntersecting ? 1 : -1;
        i.target._naTela = i.isIntersecting;
      }
    });
    aoRolar();
  });
  document.querySelectorAll('#doar, #contato, .rodape').forEach(function (z) { z._naTela = false; obsZonas.observe(z); });
  aoRolar();

  botaoTopo.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduzir ? 'auto' : 'smooth' });
  });

  /* Menu do celular: fecha ao escolher um link e trava a rolagem enquanto aberto */
  document.querySelectorAll('.menu a').forEach(function (a) {
    a.addEventListener('click', function () { toggle.checked = false; document.body.style.overflow = ''; });
  });
  toggle.addEventListener('change', function () {
    document.body.style.overflow = toggle.checked ? 'hidden' : '';
  });

  /* ---------- Link da seção atual em destaque ---------- */
  var links = {};
  document.querySelectorAll('.menu a:not(.btn)').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var obsSecao = new IntersectionObserver(function (itens) {
    itens.forEach(function (i) {
      if (!i.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].classList.remove('ativo'); });
      if (links[i.target.id]) links[i.target.id].classList.add('ativo');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { obsSecao.observe(s); });

  /* ---------- Aparecer ao rolar ---------- */
  var grupos = [
    '.causa-titulo', '.causa-texto > *', '.historia-texto',
    '.titulo-dividido', '.equipe li', '.mosaico li',
    '.etapas-bloco h3', '.etapas li', '.doar-texto > *', '.caixa-doacao',
    '.duvidas header', '.perguntas details',
    '.faixa-conteudo > *', '.contato-info > *', '.formulario > .campo, .formulario > .btn'
  ];
  var alvos = [];
  grupos.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--atraso', Math.min(i, 4) * 90 + 'ms');
      alvos.push(el);
    });
  });
  document.querySelectorAll('.etapas, .barra').forEach(function (el) { alvos.push(el); });

  var obsReveal = new IntersectionObserver(function (itens, obs) {
    itens.forEach(function (i) {
      if (!i.isIntersecting) return;
      (i.target._revelar || i.target).classList.add('visivel');
      obs.unobserve(i.target);
    });
  }, { threshold: 0.1 });
  alvos.forEach(function (el) { obsReveal.observe(el); });

  /* A foto com cortina começa recortada até largura zero, e o navegador
     não a considera visível nesse estado. Observa o bloco em volta. */
  document.querySelectorAll('.revela-foto').forEach(function (foto) {
    foto.parentElement._revelar = foto;
    obsReveal.observe(foto.parentElement);
  });

  /* ---------- Números que contam ---------- */
  var obsNum = new IntersectionObserver(function (itens, obs) {
    itens.forEach(function (i) {
      if (!i.isIntersecting) return;
      var el = i.target, alvo = +el.dataset.alvo;
      obs.unobserve(el);
      if (reduzir) return;
      var inicio = null, dur = 1800;
      function passo(t) {
        if (inicio === null) inicio = t;
        var p = Math.min((t - inicio) / dur, 1);
        el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(passo);
      }
      el.textContent = '0';
      requestAnimationFrame(passo);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-alvo]').forEach(function (el) { obsNum.observe(el); });

  /* ---------- Parallax leve na foto do início ---------- */
  var heroFoto = document.querySelector('.hero-foto');
  if (!reduzir && window.matchMedia('(min-width: 601px)').matches) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight) heroFoto.style.transform = 'translateY(' + y * 0.3 + 'px)';
    }, { passive: true });
    /* a animação de entrada usa transform; libera depois que ela termina */
    heroFoto.addEventListener('animationend', function () { heroFoto.style.animation = 'none'; });
  }

  /* Arrastar para os lados (usado no carrossel e na galeria) */
  function aoArrastar(el, esquerda, direita) {
    var x0 = null, y0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { (dx < 0 ? direita : esquerda)(); }
      x0 = null;
    });
  }

  /* ---------- Carrossel de depoimentos ---------- */
  var carrossel = document.querySelector('.historia');
  var fotosDep = carrossel.querySelectorAll('.historia-foto img');
  var textosDep = carrossel.querySelectorAll('.depoimento');
  var atualDep = 0;

  function mostrarDep(n) {
    atualDep = (n + textosDep.length) % textosDep.length;
    textosDep.forEach(function (t, i) { t.classList.toggle('ativo', i === atualDep); });
    fotosDep.forEach(function (f, i) { f.classList.toggle('ativa', i === atualDep); });
    carrossel.querySelector('.dep-atual').textContent = ('0' + (atualDep + 1)).slice(-2);
    carrossel.querySelector('.dep-trilho span').style.width = ((atualDep + 1) / textosDep.length * 100) + '%';
  }
  carrossel.querySelector('.dep-ant').addEventListener('click', function () { mostrarDep(atualDep - 1); });
  carrossel.querySelector('.dep-prox').addEventListener('click', function () { mostrarDep(atualDep + 1); });
  carrossel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') mostrarDep(atualDep - 1);
    if (e.key === 'ArrowRight') mostrarDep(atualDep + 1);
  });
  aoArrastar(carrossel, function () { mostrarDep(atualDep - 1); }, function () { mostrarDep(atualDep + 1); });

  /* ---------- Galeria: foto ampliada com setas, contador e arrastar ---------- */
  var janela = document.getElementById('janela-foto');
  var imgGrande = janela.querySelector('img');
  var contadorFoto = janela.querySelector('.janela-contador');
  var legendaFoto = janela.querySelector('.janela-legenda');
  var figuras = Array.prototype.slice.call(document.querySelectorAll('.mosaico figure'));
  var atual = 0;

  function mostrar(n) {
    atual = (n + figuras.length) % figuras.length;
    var fig = figuras[atual], img = fig.querySelector('img');
    function trocar() {
      imgGrande.src = img.src;
      imgGrande.alt = img.alt;
      imgGrande.classList.remove('trocando');
    }
    contadorFoto.textContent = (atual + 1) + ' / ' + figuras.length;
    legendaFoto.textContent = fig.querySelector('h3').textContent + '. ' + fig.querySelector('figcaption p').textContent;
    if (janela.open && !reduzir) { imgGrande.classList.add('trocando'); setTimeout(trocar, 200); } else { trocar(); }
  }

  figuras.forEach(function (fig, n) {
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'Ampliar foto: ' + fig.querySelector('h3').textContent);
    function abrir() { mostrar(n); janela.showModal(); }
    fig.addEventListener('click', abrir);
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
    });
  });

  janela.querySelector('.ant').addEventListener('click', function () { mostrar(atual - 1); });
  janela.querySelector('.prox').addEventListener('click', function () { mostrar(atual + 1); });
  janela.querySelector('.fechar').addEventListener('click', function () { janela.close(); });
  janela.addEventListener('click', function (e) { if (e.target === janela) janela.close(); });
  janela.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') mostrar(atual - 1);
    if (e.key === 'ArrowRight') mostrar(atual + 1);
  });
  aoArrastar(janela, function () { mostrar(atual - 1); }, function () { mostrar(atual + 1); });

  /* ---------- Doação em duas etapas ---------- */
  var caixa = document.querySelector('.caixa-doacao');
  var frase = document.getElementById('impacto-doacao');
  var outro = document.getElementById('v-outro');
  var rotuloOutro = outro.closest('.outro');
  var botaoContinuar = document.getElementById('continuar');
  var erroValor = document.getElementById('erro-valor');
  var etapaValor = document.getElementById('etapa-valor');
  var etapaPagamento = document.getElementById('etapa-pagamento');
  var passos = caixa.querySelectorAll('.caixa-passos li');

  /* Valores fictícios usados para calcular o impacto */
  var HORA_AULA = 20;   /* R$ por hora de aula com profissional */
  var KIT = 30;         /* R$ por kit de materiais para um idoso */
  var MINIMO = 10;

  function escolha() {
    var mensal = caixa.querySelector('input[name="frequencia"]:checked').value === 'mensal';
    var marcado = caixa.querySelector('input[name="valor"]:checked');
    var valor = marcado ? +marcado.value : Math.max(0, Math.round(+outro.value || 0));
    return { mensal: mensal, valor: valor, digitado: !marcado };
  }

  function textoValor(e) { return 'R$\u00a0' + e.valor + (e.mensal ? ' por mês' : ''); }

  function textoImpacto(e) {
    var horas = Math.floor(e.valor / HORA_AULA);
    var kits = Math.floor(e.valor / KIT);
    var inicio = 'Com <strong>' + textoValor(e) + '</strong> você ';
    if (e.valor < MINIMO) return 'Toda ajuda conta. Doações a partir de R$\u00a010 já compram material para as aulas.';
    if (e.valor >= 250) return inicio + 'financia uma oficina de formação para os cuidadores de uma instituição' + (e.mensal ? ' a cada trimestre.' : '.');
    if (horas >= 2) return inicio + 'paga ' + horas + ' horas de aula com profissional em uma instituição.';
    if (kits >= 1) return inicio + 'garante ' + (kits === 1 ? 'um kit' : kits + ' kits') + ' de faixa elástica e bastão para quem está começando.';
    return inicio + 'ajuda a comprar material para as aulas.';
  }

  function atualizar() {
    var e = escolha();
    rotuloOutro.classList.toggle('ativo', e.digitado && e.valor > 0);
    erroValor.hidden = true;
    botaoContinuar.firstChild.textContent = e.valor >= MINIMO ? 'Continuar com ' + textoValor(e) + ' ' : 'Continuar ';
    frase.classList.add('trocando');
    setTimeout(function () {
      frase.innerHTML = textoImpacto(e);
      frase.classList.remove('trocando');
    }, reduzir ? 0 : 180);
  }

  caixa.querySelectorAll('input[type="radio"]').forEach(function (r) { r.addEventListener('change', atualizar); });
  outro.addEventListener('input', function () {
    caixa.querySelectorAll('input[name="valor"]').forEach(function (r) { r.checked = false; });
    atualizar();
  });
  outro.addEventListener('focus', function () {
    if (outro.value) caixa.querySelectorAll('input[name="valor"]').forEach(function (r) { r.checked = false; });
  });

  function irPara(etapa) {
    var pagamento = etapa === 2;
    etapaValor.hidden = pagamento;
    etapaPagamento.hidden = !pagamento;
    passos[0].classList.toggle('atual', !pagamento);
    passos[0].classList.toggle('feito', pagamento);
    passos[1].classList.toggle('atual', pagamento);
    /* mantém a caixa à vista quando ela muda de altura */
    var r = caixa.getBoundingClientRect();
    if (r.top < 70) window.scrollBy({ top: r.top - 90, behavior: reduzir ? 'auto' : 'smooth' });
  }

  caixa.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var e = escolha();
    if (e.valor < MINIMO) {
      erroValor.hidden = false;
      outro.focus();
      return;
    }
    document.getElementById('resumo-doacao').innerHTML = 'Sua doação: <strong>' + textoValor(e) + '</strong>';
    caixa.querySelector('.valor-escolhido').textContent = 'R$\u00a0' + e.valor;
    caixa.querySelector('.so-mensal').hidden = !e.mensal;
    irPara(2);
    document.getElementById('resumo-doacao').focus();
  });

  document.getElementById('voltar-etapa').addEventListener('click', function () {
    irPara(1);
    botaoContinuar.focus();
  });

  /* ---------- Copiar a chave Pix ---------- */
  var botaoPix = document.getElementById('copiar-pix');
  var textoPix = botaoPix.querySelector('span');
  botaoPix.addEventListener('click', function () {
    var chave = document.getElementById('chave-pix').textContent.trim();
    function ok() {
      textoPix.textContent = 'Chave copiada';
      botaoPix.classList.add('copiado');
      setTimeout(function () { textoPix.textContent = 'Copiar chave'; botaoPix.classList.remove('copiado'); }, 2200);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(chave).then(ok, function () {});
    } else {
      /* arquivo aberto direto do computador: usa a seleção de texto como alternativa */
      var campo = document.createElement('textarea');
      campo.value = chave;
      document.body.appendChild(campo);
      campo.select();
      try { document.execCommand('copy'); ok(); } catch (e) {}
      campo.remove();
    }
  });

  /* ---------- Formulário de contato: validação e confirmação ---------- */
  var form = document.querySelector('.formulario');
  var assunto = document.getElementById('assunto');
  var mensagem = document.getElementById('mensagem');
  var contadorMsg = document.getElementById('contador-mensagem');

  /* Botões que já escolhem o assunto ("Quero ser voluntário", "Fale com a gente") */
  document.querySelectorAll('[data-assunto]').forEach(function (a) {
    a.addEventListener('click', function () { assunto.value = a.dataset.assunto; });
  });

  var mensagens = {
    nome: { valueMissing: 'Conte para a gente como você se chama.', tooShort: 'Escreva seu nome completo.' },
    email: { valueMissing: 'Precisamos do e-mail para responder.', typeMismatch: 'Confira o e-mail, parece faltar algo (exemplo: nome@email.com).' },
    mensagem: { valueMissing: 'Escreva sua mensagem.', tooShort: 'Conte um pouco mais, com pelo menos 10 letras.' }
  };

  function validar(campo) {
    var caixaCampo = campo.closest('.campo');
    var erro = document.getElementById('erro-' + campo.id);
    var v = campo.validity, texto = '';
    if (!v.valid) {
      var m = mensagens[campo.id] || {};
      texto = (v.valueMissing && m.valueMissing) || (v.typeMismatch && m.typeMismatch) || (v.tooShort && m.tooShort) || campo.validationMessage;
    }
    /* minlength só é checado pelo navegador depois que a pessoa digita; checa aqui também */
    if (!texto && campo.minLength > 0 && campo.value.trim().length < campo.minLength) texto = (mensagens[campo.id] || {}).tooShort;
    if (erro) erro.textContent = texto || '';
    caixaCampo.classList.toggle('invalido', !!texto);
    caixaCampo.classList.toggle('valido', !texto && campo.value.trim() !== '');
    campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
    return !texto;
  }

  var camposTexto = form.querySelectorAll('input, textarea');
  camposTexto.forEach(function (c) {
    /* valida ao sair do campo e, depois do primeiro erro, a cada letra */
    c.addEventListener('blur', function () { if (c.value) validar(c); });
    c.addEventListener('input', function () { if (c.closest('.campo').classList.contains('invalido')) validar(c); });
  });

  mensagem.addEventListener('input', function () {
    var n = mensagem.value.length;
    contadorMsg.textContent = n + ' de ' + mensagem.maxLength;
    contadorMsg.classList.toggle('perto', n > mensagem.maxLength - 60);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var primeiroErro = null;
    camposTexto.forEach(function (c) { if (!validar(c) && !primeiroErro) primeiroErro = c; });
    if (primeiroErro) { primeiroErro.focus(); return; }

    /* o site não tem servidor: mostra a confirmação sem enviar de verdade */
    document.getElementById('enviado-nome').textContent = document.getElementById('nome').value.trim().split(' ')[0];
    var enviado = document.getElementById('enviado');
    enviado.hidden = false;
    form.classList.add('foi-enviado');
    enviado.focus();
  });

  document.getElementById('nova-mensagem').addEventListener('click', function () {
    form.reset();
    form.querySelectorAll('.campo').forEach(function (c) { c.classList.remove('valido', 'invalido'); });
    contadorMsg.textContent = '0 de ' + mensagem.maxLength;
    document.getElementById('enviado').hidden = true;
    form.classList.remove('foi-enviado');
    document.getElementById('nome').focus();
  });
})();
