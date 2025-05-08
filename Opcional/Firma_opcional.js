// Generador de links personalizados para Carta de Amor (solo mensaje y firma)

function generarLink({ mensaje, firma }) {
    const baseUrl = "https://zero3-web.github.io/Carta-de-Amor/";
    const params = [];
    if (mensaje) params.push("mensaje=" + encodeURIComponent(mensaje));
    if (firma) params.push("firma=" + encodeURIComponent(firma));
    return baseUrl + (params.length ? "?" + params.join("&") : "");
  }
  
  // Ejemplo de uso en consola:
  console.log(
    generarLink({
      mensaje: "Eres la mejor mamá del mundo. ¡Te amo mucho!",
      firma: "Con cariño, tu hijo"
    })
  );
  
  // Puedes usar esta función en tu HTML o consola para generar links rápidamente.