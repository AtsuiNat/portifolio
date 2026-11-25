const relogioEsteio = document.querySelector(".relogio-esteio");
const relogioVisitante = document.querySelector(".relogio-visitante");
const intro = document.getElementById("intro");
const barraProgresso = document.querySelector(".intro-progresso span");
const raiz = document.documentElement;
const menu = document.getElementById("menu");
const hamb = document.getElementById("hamb");
const secoes = ["topo", "sobre", "base", "projetos", "formacao", "contato"];
let marcarTravado = false;

function atualizarHora() {
  const agora = new Date();
  const horaEsteio = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(agora);
  relogioEsteio.textContent = horaEsteio;
  relogioEsteio.dateTime = agora.toISOString();

  const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (fuso === "America/Sao_Paulo") {
    relogioVisitante.hidden = true;
    return;
  }

  const horaLocal = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(agora);
  const regiao = fuso.split("/").pop().replaceAll("_", " ");
  relogioVisitante.hidden = false;
  relogioVisitante.textContent = `${regiao} · ${horaLocal}`;
}

function marcarSecao(id) {
  document.querySelectorAll(".menu a").forEach((link) => {
    const ativo = link.getAttribute("href") === `#${id}`;
    if (ativo) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function secaoPelaRolagem() {
  const linha = 120;
  let atual = "topo";
  secoes.forEach((id) => {
    const secao = document.getElementById(id);
    if (secao && secao.getBoundingClientRect().top - linha <= 0) atual = id;
  });
  const noFim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
  if (!noFim) return atual;
  for (let i = secoes.length - 1; i >= 0; i--) {
    const secao = document.getElementById(secoes[i]);
    if (!secao) continue;
    const caixa = secao.getBoundingClientRect();
    if (caixa.top < window.innerHeight * 0.8 && caixa.bottom > 90) return secoes[i];
  }
  return atual;
}

function marcarMenu() {
  if (marcarTravado) return;
  marcarSecao(secaoPelaRolagem());
}

function observar() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".aparece").forEach((el) => el.classList.add("visivel"));
    return;
  }
  const olho = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("visivel");
      olho.unobserve(entrada.target);
    });
  }, { threshold: 0.16 });
  document.querySelectorAll(".aparece").forEach((el) => olho.observe(el));
}

function liberar() {
  if (raiz.dataset.saiu === "1") return;
  raiz.dataset.saiu = "1";
  if (!intro) {
    raiz.classList.remove("travado");
    raiz.classList.add("liberado");
    observar();
    return;
  }
  intro.classList.add("saindo");
  window.setTimeout(() => {
    intro.remove();
    raiz.classList.remove("travado");
    raiz.classList.add("liberado");
    observar();
    marcarMenu();
  }, 680);
}

function prepararIntro() {
  if (!intro || raiz.classList.contains("liberado")) {
    intro?.remove();
    raiz.classList.add("liberado");
    observar();
    return;
  }
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") liberar();
  });
  barraProgresso.addEventListener("animationend", liberar);
  window.setTimeout(liberar, 1900);
}

function alternarProjeto(artigo) {
  const botao = artigo.querySelector("[data-sem-link]");
  const aviso = artigo.querySelector(".aviso");
  const nome = botao.querySelector(".nome-botao");
  const aberto = !artigo.classList.contains("is-aberto");
  artigo.classList.toggle("is-aberto", aberto);
  aviso.hidden = !aberto;
  botao.setAttribute("aria-expanded", aberto ? "true" : "false");
  nome.textContent = aberto ? "Fechar" : "Abrir";
}

document.querySelectorAll(".mudo").forEach((artigo) => {
  artigo.querySelector("[data-sem-link]").addEventListener("click", () => {
    alternarProjeto(artigo);
  });
});

function fecharMenu() {
  menu.classList.remove("aberto");
  hamb.setAttribute("aria-expanded", "false");
  hamb.querySelector(".sr").textContent = "Abrir menu";
}

hamb.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  hamb.setAttribute("aria-expanded", aberto ? "true" : "false");
  hamb.querySelector(".sr").textContent = aberto ? "Fechar menu" : "Abrir menu";
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && menu.classList.contains("aberto")) fecharMenu();
});

function destinoDe(id) {
  if (id === "#topo") return 0;
  const alvo = document.querySelector(id);
  if (!alvo) return 0;
  const ponto = alvo.querySelector("h2") || alvo;
  const barra = document.querySelector(".barra").getBoundingClientRect().height;
  return Math.max(0, ponto.getBoundingClientRect().top + window.scrollY - barra - 16);
}

function ajustarFim() {
  const fecho = document.querySelector(".fecho");
  const titulo = document.querySelector("#contato h2");
  if (!fecho || !titulo) return;
  document.body.style.paddingBottom = "0px";
  fecho.style.minHeight = "0px";
  const barra = document.querySelector(".barra").offsetHeight;
  const topo = fecho.getBoundingClientRect().top + window.scrollY;
  const tituloY = titulo.getBoundingClientRect().top + window.scrollY;
  const destino = Math.max(0, tituloY - barra - 16);
  const altura = destino + window.innerHeight - topo;
  fecho.style.minHeight = `${Math.max(0, Math.ceil(altura))}px`;
  const maximo = document.documentElement.scrollHeight - window.innerHeight;
  const folgaNoFim = tituloY - maximo - barra;
  const sobra = 16 - folgaNoFim;
  if (sobra > 1) {
    fecho.style.minHeight = `${Math.max(0, Math.ceil(altura - sobra))}px`;
  }
}

let viagem = 0;

function irPara(id) {
  const alvo = document.querySelector(id);
  if (!alvo) return;
  const esta = ++viagem;
  marcarTravado = true;
  const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: destinoDe(id), behavior: suave ? "smooth" : "auto" });
  history.replaceState(null, "", id);
  const soltar = () => {
    if (esta !== viagem) return;
    viagem += 1;
    const certo = destinoDe(id);
    if (Math.abs(window.scrollY - certo) > 2) {
      window.scrollTo({ top: certo, behavior: "auto" });
    }
    marcarTravado = false;
    marcarMenu();
  };
  window.addEventListener("scrollend", soltar, { once: true });
  window.setTimeout(soltar, 900);
}

document.querySelectorAll(".menu a, .marca").forEach((link) => {
  link.addEventListener("click", (evento) => {
    const id = link.getAttribute("href");
    if (!id || !id.startsWith("#")) return;
    evento.preventDefault();
    fecharMenu();
    irPara(id);
  });
});

let quadro = false;
window.addEventListener("scroll", () => {
  if (quadro) return;
  quadro = true;
  requestAnimationFrame(() => {
    marcarMenu();
    quadro = false;
  });
}, { passive: true });

function criarOnda(evento) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const alvo = evento.target.closest(".botao, .lista li, .menu a, .cartao, .hamb");
  if (!alvo || alvo.closest(".intro")) return;
  const caixa = alvo.getBoundingClientRect();
  const tamanho = Math.max(caixa.width, caixa.height);
  const onda = document.createElement("span");
  onda.className = "onda";
  onda.style.width = `${tamanho}px`;
  onda.style.height = `${tamanho}px`;
  onda.style.left = `${evento.clientX - caixa.left - tamanho / 2}px`;
  onda.style.top = `${evento.clientY - caixa.top - tamanho / 2}px`;
  alvo.appendChild(onda);
  onda.addEventListener("animationend", () => onda.remove());
}

document.addEventListener("pointerdown", criarOnda);

atualizarHora();
setInterval(atualizarHora, 1000);
ajustarFim();
window.addEventListener("resize", ajustarFim);
prepararIntro();
marcarMenu();
