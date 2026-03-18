const testButton = document.getElementById("testBtn");
const status = document.getElementById("status");

if (testButton && status) {
  testButton.addEventListener("click", () => {
    status.textContent = "Interação ativa: sua landing page está pronta para impressionar.";
  });
}
