/* =====================================================================
   1. VIDEO: vertical en celular (hero.mp4), horizontal en PC (hero-pc.mp4)
   ===================================================================== */
const video = document.getElementById("heroVideo");
const pantallaChica = window.matchMedia("(max-width: 767px)");
const CEL = "hero.mp4";
const PC = "hero-pc.mp4";

video.muted = true;
video.defaultMuted = true;
video.playsInline = true;

function reproducir() {
  const p = video.play();
  if (p) p.catch(() => {});
}

// Carga un archivo; si no existe, prueba con el de respaldo
function cargar(archivo, respaldo) {
  video.classList.remove("listo");
  video.onerror = () => {
    video.onerror = null;
    if (respaldo) cargar(respaldo, null);
  };
  video.src = archivo;
  video.load();
  reproducir();
}

function elegirVideo() {
  const archivo = pantallaChica.matches ? CEL : PC;
  if (video.dataset.actual === archivo) return;
  video.dataset.actual = archivo;
  cargar(archivo, archivo === PC ? CEL : null); // en PC, si falta hero-pc.mp4 usa hero.mp4
}

video.addEventListener("loadeddata", () => {
  video.classList.add("listo");
  reproducir();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && video.paused) reproducir();
});
["touchstart", "click", "scroll"].forEach((tipo) =>
  addEventListener(tipo, () => { if (video.paused) reproducir(); }, { once: true, passive: true })
);
pantallaChica.addEventListener("change", elegirVideo);
elegirVideo();


/* =====================================================================
   2. CATÁLOGO: cambia los nombres y pon el camino de tus fotos en "img"
      Ejemplo: { nombre: "Camisa blanca", img: "img/camisa1.jpg" }
      Si "img" está vacío, se ve un cuadro de color de prueba.
   ===================================================================== */
const CATALOGO = {
  camisas: [
    { nombre: "Camisa 1", img: "" },
    { nombre: "Camisa 2", img: "" },
    { nombre: "Camisa 3", img: "" },
  ],
  pantalones: [
    { nombre: "Pantalón 1", img: "" },
    { nombre: "Pantalón 2", img: "" },
    { nombre: "Pantalón 3", img: "" },
  ],
  vestidos: [
    { nombre: "Vestido 1", img: "" },
    { nombre: "Vestido 2", img: "" },
    { nombre: "Vestido 3", img: "" },
  ],
  verano: [
    { nombre: "Verano 1", img: "" },
    { nombre: "Verano 2", img: "" },
    { nombre: "Verano 3", img: "" },
    { nombre: "Verano 4", img: "" },
  ],
  invierno: [
    { nombre: "Invierno 1", img: "" },
    { nombre: "Invierno 2", img: "" },
    { nombre: "Invierno 3", img: "" },
    { nombre: "Invierno 4", img: "" },
  ],
  navidad: [
    { nombre: "Navidad 1", img: "" },
    { nombre: "Navidad 2", img: "" },
    { nombre: "Navidad 3", img: "" },
    { nombre: "Navidad 4", img: "" },
  ],
};

const TITULOS = {
  todos: "Todos los artículos", camisas: "Camisas", pantalones: "Pantalones", vestidos: "Vestidos",
  verano: "Colección Verano", invierno: "Colección Invierno", navidad: "Colección Navidad",
};
// Palabras que la búsqueda entiende para cada grupo (sin tildes)
const PALABRAS = {
  camisas: "camisa camisas", pantalones: "pantalon pantalones", vestidos: "vestido vestidos",
  verano: "verano coleccion", invierno: "invierno coleccion", navidad: "navidad coleccion",
};
const TONO = { camisas: 205, pantalones: 30, vestidos: 340, verano: 45, invierno: 215, navidad: 0 };

const $ = (id) => document.getElementById(id);

const D = {};
for (const k in CATALOGO) D[k] = CATALOGO[k].map((p) => ({ k, t: p.nombre, img: p.img || "" }));
D.todos = [...D.camisas, ...D.pantalones, ...D.vestidos];
const TODOS_BUSCAR = [...D.todos, ...D.verano, ...D.invierno, ...D.navidad];

// Fondo de una foto: la imagen si existe, si no un color de prueba
const fondo = (f) => f.img
  ? `center / cover no-repeat url("${f.img}")`
  : `linear-gradient(160deg, hsl(${TONO[f.k]} 65% 88%), hsl(${TONO[f.k] + 20} 55% 72%))`;
const etiqueta = (f) => (f.img ? "" : f.t);

let lista = [];
let pos = 0;


/* =====================================================================
   3. MENÚ (las 3 rayas)
   ===================================================================== */
function menu(abierto) {
  $("menu").classList.toggle("on", abierto);
  $("vel").classList.toggle("on", abierto);
}
function acordeon(boton, panel) {
  const abierto = $(panel).classList.toggle("on");
  $(boton).setAttribute("aria-expanded", abierto);
}
$("abrir").onclick = () => menu(true);
$("cerrar").onclick = () => menu(false);
$("vel").onclick = () => menu(false);
$("b-compras").onclick = () => acordeon("b-compras", "s-compras");
$("b-col").onclick = () => acordeon("b-col", "s-col");
document.querySelectorAll(".sub button").forEach((b) => (b.onclick = () => abrirVista(b.dataset.v)));


/* =====================================================================
   4. VISTA DE FOTOS y VISOR (una por una)
   ===================================================================== */
function abrirVista(clave) {
  lista = D[clave];
  $("titulo").textContent = TITULOS[clave];
  menu(false);
  $("rejilla").innerHTML = lista
    .map((f, i) => `<div class="foto" data-i="${i}" style="background:${fondo(f)}">${etiqueta(f)}</div>`)
    .join("");
  $("vista").classList.add("on");
  $("vista").scrollTop = 0;
}
$("atras").onclick = () => { $("vista").classList.remove("on"); menu(true); };
$("rejilla").onclick = (e) => {
  const f = e.target.closest(".foto");
  if (f) ver(+f.dataset.i);
};

function ver(i) {
  pos = (i + lista.length) % lista.length;
  const f = lista[pos];
  $("grande").style.background = fondo(f);
  $("grande").textContent = etiqueta(f);
  $("contador").textContent = pos + 1 + " / " + lista.length;
  $("visor").classList.add("on");
}
$("prev").onclick = () => ver(pos - 1);
$("next").onclick = () => ver(pos + 1);
$("x").onclick = () => $("visor").classList.remove("on");


/* =====================================================================
   5. BÚSQUEDA (la lupa)
   ===================================================================== */
const norm = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const clave = (f) => norm(f.t + " " + PALABRAS[f.k]);
const tarjetas = (l) => l
  .map((f, i) => `<div class="pf" data-i="${i}"><div class="foto" style="background:${fondo(f)}">${etiqueta(f)}</div><div class="pts"><i class="on"></i><i></i><i></i></div></div>`)
  .join("");

function buscar(texto) {
  const q = norm(texto.trim());
  const r = q ? TODOS_BUSCAR.filter((f) => clave(f).includes(q)) : [];
  lista = r.length ? r : TODOS_BUSCAR; // si no hay coincidencias, muestra artículos igual
  $("brejilla").innerHTML = tarjetas(lista);
}
$("lupa").onclick = () => {
  $("busq").classList.add("on");
  $("bq").value = "";
  buscar("");
  $("bq").focus();
};
$("bq").oninput = (e) => buscar(e.target.value);
$("sug").onclick = (e) => {
  const b = e.target.closest("button");
  if (b) { $("bq").value = b.dataset.q; buscar(b.dataset.q); }
};
$("bcerrar").onclick = () => $("busq").classList.remove("on");
$("brejilla").onclick = (e) => {
  const f = e.target.closest(".pf");
  if (f) ver(+f.dataset.i);
};


/* =====================================================================
   6. CUENTA (el muñeco): login, crear cuenta, olvidé contraseña, contacto
      Nota: estos formularios todavía no envían nada a ningún servidor.
   ===================================================================== */
const MODOS = {
  login: { t: "Login", b: "Sign in", nom: 0, pass: 1, olv: 1, alt: "Create account" },
  crear: { t: "Create account", b: "Create account", nom: 1, pass: 1, olv: 0, alt: "Back to login" },
  reset: { t: "Reset password", b: "Send", nom: 0, pass: 0, olv: 0, alt: "Back to login" },
};
let modoActual = "login";
function modo(m) {
  const c = MODOS[m];
  modoActual = m;
  $("atitulo").textContent = c.t;
  $("abtn").textContent = c.b;
  $("crear").textContent = c.alt;
  $("lnom").hidden = !c.nom;
  $("lpass").hidden = !c.pass;
  $("olvido").hidden = !c.olv;
  $("aform").reset();
}
$("muneco").onclick = () => { modo("login"); $("cuenta").classList.add("on"); $("cuenta").scrollTop = 0; };
$("c-logo").onclick = () => $("cuenta").classList.remove("on");
$("c-menu").onclick = () => { $("cuenta").classList.remove("on"); menu(true); };
$("c-lupa").onclick = () => { $("cuenta").classList.remove("on"); $("lupa").click(); };
$("crear").onclick = (e) => { e.preventDefault(); modo(modoActual === "login" ? "crear" : "login"); };
$("olvido").onclick = (e) => { e.preventDefault(); modo("reset"); };
$("aform").onsubmit = (e) => e.preventDefault();
$("cform").onsubmit = (e) => {
  e.preventDefault();
  const b = $("cbtn");
  b.textContent = "Sent ✓";
  setTimeout(() => { b.textContent = "Send"; $("cform").reset(); }, 2000);
};


/* =====================================================================
   7. TECLADO: flechas en el visor y Escape para cerrar
   ===================================================================== */
addEventListener("keydown", (e) => {
  if ($("visor").classList.contains("on")) {
    if (e.key === "ArrowLeft") ver(pos - 1);
    if (e.key === "ArrowRight") ver(pos + 1);
    if (e.key === "Escape") $("visor").classList.remove("on");
    return;
  }
  if (e.key === "Escape") {
    menu(false);
    ["busq", "cuenta", "vista"].forEach((id) => $(id).classList.remove("on"));
  }
});