// ===== Tela de Login/Cadastro =====
function initLoginPage() {
  const btnSignin = document.querySelector("#signin");
  const btnSignup = document.querySelector("#signup");
  const body = document.querySelector("body");

  if (!btnSignin || !btnSignup) return;

  btnSignin.addEventListener("click", () => {
    body.className = "sign-in-js";
  });

  btnSignup.addEventListener("click", () => {
    body.className = "sign-up-js";
  });
}

// ===== Tela de Escolha ONG/Usuário =====
function initEscolhaPage() {
  const overlay = document.querySelector(".overlay");
  const ongSide = document.getElementById("ong");
  const volSide = document.getElementById("voluntario");

  if (!overlay || !ongSide || !volSide) return;

  ongSide.addEventListener("mouseenter", () => (overlay.style.left = "50%"));
  ongSide.addEventListener("mouseleave", () => (overlay.style.left = "0"));
  volSide.addEventListener("mouseenter", () => (overlay.style.left = "0"));
  volSide.addEventListener("mouseleave", () => (overlay.style.left = "50%"));
}

// Detecta qual tela está aberta
document.addEventListener("DOMContentLoaded", () => {
  initLoginPage();
  initEscolhaPage();
});
