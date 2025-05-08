document.getElementById('linkForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const mensaje = document.getElementById('mensaje').value.trim();
  const firma = document.getElementById('firma').value.trim();
  const baseUrl = "https://zero3-web.github.io/Carta-de-Amor/";
  const params = [];
  if (mensaje) params.push("mensaje=" + encodeURIComponent(mensaje));
  if (firma) params.push("firma=" + encodeURIComponent(firma));
  const link = baseUrl + (params.length ? "?" + params.join("&") : "");
  document.getElementById('linkOutput').value = link;
  document.getElementById('resultado').style.display = "block";
  document.getElementById('copyMsg').textContent = "";
});

document.getElementById('copyBtn').addEventListener('click', function() {
  const linkInput = document.getElementById('linkOutput');
  linkInput.select();
  linkInput.setSelectionRange(0, 99999);
  document.execCommand('copy');
  document.getElementById('copyMsg').textContent = "¡Copiado!";
  setTimeout(() => {
    document.getElementById('copyMsg').textContent = "";
  }, 1200);
});
