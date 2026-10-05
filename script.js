/* Video: vertical en celular, horizontal en computadora */
const video = document.getElementById("heroVideo");
const pantallaChica = window.matchMedia("(max-width: 767px)");

function elegirVideo() {
  const archivo = pantallaChica.matches ? "hero.mp4" : "hero-pc.mp4";
  if (!video.src.endsWith(archivo)) {
    video.src = archivo;
    video.play().catch(() => {});
  }
}
elegirVideo();
pantallaChica.addEventListener("change", elegirVideo);