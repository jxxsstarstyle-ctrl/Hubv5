const btn = document.getElementById("testBtn");
const status = document.getElementById("status");

btn.addEventListener("click", () => {
  status.textContent = "Tudo funcionando.";
  console.log("JS carregado com sucesso.");
});
