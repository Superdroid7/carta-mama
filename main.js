const canvas = document.getElementById('cartaCanvas');
const ctx = canvas.getContext('2d');

// --- NUEVO: Canvas de fondo para corazones y brillos ---
const bgCanvas = document.createElement('canvas');
bgCanvas.id = 'bgCanvas';
bgCanvas.style.position = 'fixed';
bgCanvas.style.left = '0';
bgCanvas.style.top = '0';
bgCanvas.style.width = '100vw';
bgCanvas.style.height = '100vh';
bgCanvas.style.pointerEvents = 'none';
bgCanvas.style.zIndex = '1';
document.body.insertBefore(bgCanvas, document.body.firstChild);
const bgCtx = bgCanvas.getContext('2d');

// Carta config
const carta = {
  x: 100, y: 100, w: 300, h: 180,
  flapHeight: 60,
  openProgress: 0, // 0 cerrado, 1 abierto
  opening: false,
  bounce: 0 // rebote de la tapa
};

// Corazones animados
const corazones = [];
function crearCorazon() {
  // Colores variados
  const colores = ["#e63946", "#ffb4d9", "#ff6f91", "#ffb3c6"];
  const color = colores[Math.floor(Math.random()*colores.length)];
  // Corazones más esparcidos por toda la pantalla
  const x = Math.random() * bgCanvas.width;
  const y = bgCanvas.height - 40;
  const size = 18 + Math.random()*16;
  const speed = 1.1 + Math.random()*1.5;
  const dx = (Math.random()-0.5)*1.8;
  const curve = (Math.random()-0.5)*0.012;
  corazones.push({
    x,
    y,
    size,
    speed,
    dx,
    alpha: 1,
    rot: (Math.random()-0.5)*0.7,
    color,
    curve,
    t: 0
  });
}

function dibujarCorazon(x, y, size, alpha=1, rot=0, color="#e63946") {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size/2, -size/2, -size, size/3, 0, size);
  ctx.bezierCurveTo(size, size/3, size/2, -size/2, 0, 0);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

// Partículas de brillo
const brillos = [];
function crearBrillo() {
  for (let i=0; i<8; i++) {
    brillos.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height * 0.7 + bgCanvas.height * 0.15,
      r: 1 + Math.random()*2.5,
      alpha: 0.7 + Math.random()*0.3,
      vy: -0.5 - Math.random()*1.2,
      life: 40 + Math.random()*30
    });
  }
}
function dibujarBrillos() {
  for (let i=brillos.length-1; i>=0; i--) {
    const b = brillos[i];
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, 2*Math.PI);
    ctx.fillStyle = "#fffbe8";
    ctx.shadowColor = "#fffbe8";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
    b.y += b.vy;
    b.alpha -= 0.012;
    b.life--;
    if (b.life <= 0 || b.alpha <= 0) brillos.splice(i,1);
  }
}

// Mensaje
let mensaje = "¡Te amo mucho , gracias por ser como eres y por esforzarte cada dia #03 💌";
let mostrarMensaje = false;
let mensajeAnim = {
  texto: "",
  idx: 0,
  timer: null,
  velocidad: 28 // ms por letra
};

// --- Papel 3D DOM y animación ---
const papel3d = document.getElementById('papel3d');
const papelMsg = document.getElementById('papelMsg');

// Actualiza el mensaje animado en el papel3d
function updatePapelMsg() {
  papelMsg.textContent = mensajeAnim.texto || "";
}

// Posiciona y escala el papel3d centrado sobre el canvas
function positionPapel3d() {
  const rect = canvas.getBoundingClientRect();
  // Centrar el papel3d sobre el canvas y hacerlo más grande
  papel3d.style.left = (rect.left + window.scrollX + rect.width / 2) + "px";
  papel3d.style.top = (rect.top + window.scrollY + rect.height / 2) + "px";
  papel3d.style.width = rect.width * 0.8 + "px";
  papel3d.style.height = rect.height * 0.6 + "px";
}
window.addEventListener('resize', positionPapel3d);

// Modificar iniciarAnimMensaje para actualizar el papel3d
function iniciarAnimMensaje() {
  mensajeAnim.texto = "";
  mensajeAnim.idx = 0;
  updatePapelMsg();
  if (mensajeAnim.timer) clearInterval(mensajeAnim.timer);
  mensajeAnim.timer = setInterval(() => {
    if (mensajeAnim.idx < mensaje.length) {
      mensajeAnim.texto += mensaje[mensajeAnim.idx];
      mensajeAnim.idx++;
      updatePapelMsg();
    } else {
      clearInterval(mensajeAnim.timer);
    }
  }, mensajeAnim.velocidad);
}

// Mostrar el papel3d con animación de desdoblado 3D y brillo
function mostrarPapel3d() {
  positionPapel3d();
  papel3d.classList.add('visible');
  // Estado inicial: doblado y pequeño
  gsap.set(papel3d, {
    opacity: 0,
    scaleX: 0.7,
    scaleY: 0.1,
    rotateX: 80,
    filter: "brightness(1.2) drop-shadow(0 0 32px #fffbe8cc)"
  });
  // Animación de desdoblado con rebote y brillo
  gsap.to(papel3d, {
    opacity: 1,
    scaleX: 1.18,
    scaleY: 1.05,
    rotateX: -8,
    filter: "brightness(1.25) drop-shadow(0 0 48px #fffbe8cc)",
    duration: 0.7,
    ease: "power4.out",
    onComplete: () => {
      // Rebote y relajación final
      gsap.to(papel3d, {
        scaleX: 1,
        scaleY: 1,
        rotateX: 0,
        filter: "brightness(1) drop-shadow(0 0 0px #fffbe800)",
        duration: 0.7,
        ease: "elastic.out(1, 0.5)"
      });
    }
  });
}

// Ocultar el papel3d con animación inversa
function ocultarPapel3d() {
  gsap.to(papel3d, {
    opacity: 0,
    scaleX: 0.7,
    scaleY: 0.1,
    rotateX: 80,
    filter: "brightness(1.2) drop-shadow(0 0 32px #fffbe8cc)",
    duration: 0.6,
    ease: "power2.in",
    onComplete: () => {
      papel3d.classList.remove('visible');
      papelMsg.textContent = "";
    }
  });
}

// --- Destello animado en el borde dorado ---
let destello = {
  t: 0,
  active: false
};

function dibujarCarta() {
  // Sombra y brillo al abrir
  ctx.save();
  ctx.shadowColor = "#b5838d";
  ctx.shadowBlur = 18 * (1-carta.openProgress);
  ctx.fillStyle = "#fff";
  ctx.fillRect(carta.x+8, carta.y+8, carta.w, carta.h);
  if (carta.openProgress > 0.95) {
    // Efecto de brillo
    ctx.globalAlpha = (carta.openProgress-0.95)/0.05 * 0.5;
    ctx.fillStyle = "#fffbe8";
    ctx.beginPath();
    ctx.ellipse(carta.x + carta.w/2, carta.y + carta.h/2, carta.w/2, carta.h/3, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // Cuerpo de la carta con borde dorado
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(carta.x, carta.y, carta.w, carta.h);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- Detalles "Para:" y "De:" en el sobre ---
  if (carta.openProgress < 0.2) {
    ctx.save();
    ctx.font = "bold 1.05rem 'Montserrat', sans-serif";
    ctx.fillStyle = "#b5838d";
    ctx.globalAlpha = 0.85;
    // "Para:"
    ctx.textAlign = "left";
    ctx.fillText("Para:", carta.x + 18, carta.y + 32);
    ctx.font = "normal 1rem 'Pacifico', cursive";
    ctx.fillText("Gaby", carta.x + 70, carta.y + 32);
    // "De:"
    ctx.font = "bold 1.05rem 'Montserrat', sans-serif";
    ctx.textAlign = "right";
    // Ajustar la posición Y para que esté más abajo y alineado
    const deY = carta.y + carta.h - 20; // antes era -18
    ctx.fillText("De:", carta.x + carta.w - 300, deY);
    ctx.font = "normal 1rem 'Pacifico', cursive";
    ctx.fillText("Benjamin", carta.x + carta.w - 200, deY);
    // Corazón al lado de "Zero"
    ctx.save();
    ctx.globalAlpha = 0.7;
    dibujarCorazon(carta.x + carta.w - 28, deY - 8, 18, 1, 0, "#e63946");
    ctx.restore();
    ctx.restore();
  }

  // --- Destello animado en el borde dorado ---
  ctx.save();
  ctx.strokeStyle = "#ffd700";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(carta.x, carta.y, carta.w, carta.h);
  ctx.stroke();

  // Destello
  if (destello.active) {
    const t = destello.t;
    const len = 2*(carta.w + carta.h);
    const pos = (t % 1) * len;
    ctx.save();
    ctx.strokeStyle = ctx.createLinearGradient(
      carta.x, carta.y, carta.x + carta.w, carta.y + carta.h
    );
    ctx.shadowColor = "#fffbe8";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    // Recorrer el borde y dibujar un segmento brillante
    let p = pos;
    for (let i = 0; i < 1; i += 0.25) {
      let seg = Math.min(40, len - p);
      if (p < carta.w) {
        ctx.moveTo(carta.x + p, carta.y);
        ctx.lineTo(carta.x + Math.min(carta.w, p + seg), carta.y);
      } else if (p < carta.w + carta.h) {
        ctx.moveTo(carta.x + carta.w, carta.y + (p - carta.w));
        ctx.lineTo(carta.x + carta.w, carta.y + Math.min(carta.h, p - carta.w + seg));
      } else if (p < 2 * carta.w + carta.h) {
        ctx.moveTo(carta.x + carta.w - (p - carta.w - carta.h), carta.y + carta.h);
        ctx.lineTo(carta.x + carta.w - Math.min(carta.w, p - carta.w - carta.h + seg), carta.y + carta.h);
      } else {
        ctx.moveTo(carta.x, carta.y + carta.h - (p - 2 * carta.w - carta.h));
        ctx.lineTo(carta.x, carta.y + carta.h - Math.min(carta.h, p - 2 * carta.w - carta.h + seg));
      }
      p += 60;
    }
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // Líneas decorativas
  ctx.save();
  ctx.strokeStyle = "#f9c6d1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(carta.x+20, carta.y+carta.h-20);
  ctx.lineTo(carta.x+carta.w-20, carta.y+carta.h-20);
  ctx.stroke();
  ctx.restore();

  // Sello de corazón
  ctx.save();
  ctx.globalAlpha = 0.7;
  dibujarCorazon(carta.x + carta.w - 36, carta.y + carta.h - 36, 22, 1, 0, "#e63946");
  ctx.restore();

  // Flap (tapa) animada con rebote
  ctx.save();
  ctx.translate(carta.x + carta.w/2, carta.y);
  let flapAngle = -Math.PI/2 * carta.openProgress + carta.bounce;
  ctx.rotate(flapAngle);
  ctx.beginPath();
  ctx.moveTo(-carta.w/2, 0);
  ctx.lineTo(0, -carta.flapHeight);
  ctx.lineTo(carta.w/2, 0);
  ctx.closePath();
  ctx.fillStyle = "#f9c6d1";
  ctx.strokeStyle = "#b5838d";
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Papel interior animado y adaptativo
  if (carta.openProgress > 0.7) {
    ctx.save();
    let slide = Math.min(1, (carta.openProgress-0.7)/0.3);
    ctx.globalAlpha = slide;
    ctx.fillStyle = "#fffbe8";
    ctx.strokeStyle = "#b5838d";
    ctx.lineWidth = 1.5;

    // Calcular alto del papel según el mensaje
    const paperX = carta.x+18;
    const paperW = carta.w-36;
    const minPaperH = carta.h-60;
    const maxPaperH = carta.h*1.2;
    ctx.font = "bold 30px 'Pacifico', cursive";
    const lineHeight = 36;
    const words = mensaje.split(' ');
    let lines = [];
    let currentLine = "";
    for (let i = 0; i < words.length; i++) {
      let testLine = currentLine + (currentLine ? " " : "") + words[i];
      let testWidth = ctx.measureText(testLine).width;
      if (testWidth > paperW-24 && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    let paperH = Math.max(minPaperH, Math.min(maxPaperH, lines.length * lineHeight + 40));
    let paperY = carta.y+30 + (1-slide)*40 - (paperH-minPaperH)/2;

    ctx.beginPath();
    ctx.rect(paperX, paperY, paperW, paperH);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  dibujarConfeti();
}

// Dibuja corazones en el fondo
function dibujarCorazonesBg() {
  for (let i = corazones.length-1; i >= 0; i--) {
    const c = corazones[i];
    c.t += 1;
    c.y -= c.speed;
    c.x += c.dx + Math.sin(c.t*0.04)*c.curve*80;
    c.alpha -= 0.0009;
    dibujarCorazonBg(c.x, c.y, c.size, c.alpha, c.rot, c.color);
    if (c.alpha <= 0) corazones.splice(i, 1);
  }
}
function dibujarCorazonBg(x, y, size, alpha=1, rot=0, color="#e63946") {
  bgCtx.save();
  bgCtx.translate(x, y);
  bgCtx.rotate(rot);
  bgCtx.globalAlpha = alpha;
  bgCtx.beginPath();
  bgCtx.moveTo(0, 0);
  bgCtx.bezierCurveTo(-size/2, -size/2, -size, size/3, 0, size);
  bgCtx.bezierCurveTo(size, size/3, size/2, -size/2, 0, 0);
  bgCtx.fillStyle = color;
  bgCtx.shadowColor = color;
  bgCtx.shadowBlur = 10;
  bgCtx.fill();
  bgCtx.globalAlpha = 1;
  bgCtx.shadowBlur = 0;
  bgCtx.restore();
}

// Dibuja brillos en el fondo
function dibujarBrillosBg() {
  for (let i=brillos.length-1; i>=0; i--) {
    const b = brillos[i];
    bgCtx.save();
    bgCtx.globalAlpha = b.alpha;
    bgCtx.beginPath();
    bgCtx.arc(b.x, b.y, b.r, 0, 2*Math.PI);
    bgCtx.fillStyle = "#fffbe8";
    bgCtx.shadowColor = "#fffbe8";
    bgCtx.shadowBlur = 12;
    bgCtx.fill();
    bgCtx.restore();
    b.y += b.vy;
    b.alpha -= 0.012;
    b.life--;
    if (b.life <= 0 || b.alpha <= 0) brillos.splice(i,1);
  }
}

function animar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  dibujarCarta();

  // --- Destello animado en el borde dorado ---
  if (destello.active) {
    destello.t += 0.018;
    if (destello.t > 1.2) destello.active = false;
  }

  requestAnimationFrame(animar);
}

// --- NUEVO: Animación de fondo ---
function animarBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  if (carta.openProgress > 0.7) {
    if (Math.random() < 0.05) crearCorazon();
  }
  dibujarCorazonesBg();
  dibujarBrillosBg();
  requestAnimationFrame(animarBg);
}
animarBg();

// Confeti animado
const confetis = [];
function lanzarConfeti() {
  const colores = ["#e63946", "#ffb4d9", "#ff6f91", "#ffb3c6", "#ffd700", "#b5838d", "#fffbe8"];
  for (let i = 0; i < 32; i++) {
    confetis.push({
      x: carta.x + carta.w/2,
      y: carta.y + carta.h/2,
      r: 6 + Math.random()*6,
      color: colores[Math.floor(Math.random()*colores.length)],
      vx: (Math.random()-0.5)*7,
      vy: -4 - Math.random()*5,
      ay: 0.18 + Math.random()*0.08,
      rot: Math.random()*Math.PI*2,
      vr: (Math.random()-0.5)*0.2,
      alpha: 1
    });
  }
}
function dibujarConfeti() {
  for (let i = confetis.length-1; i >= 0; i--) {
    const c = confetis[i];
    ctx.save();
    ctx.globalAlpha = c.alpha;
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, c.r, c.r*0.5, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
    c.x += c.vx;
    c.y += c.vy;
    c.vy += c.ay;
    c.rot += c.vr;
    c.alpha -= 0.008;
    if (c.alpha <= 0 || c.y > canvas.height+40) confetis.splice(i, 1);
  }
}

// Agrandar carta y blur fondo al abrir
function abrirCarta() {
  if (carta.opening) return;
  carta.opening = true;
  document.getElementById('subtitle').style.opacity = 0;
  document.getElementById('openSound').currentTime = 0;
  document.getElementById('openSound').play();
  // --- Música de fondo ---
  const bgMusic = document.getElementById('bgMusic');
  bgMusic.currentTime = 0;
  bgMusic.volume = 0.45;
  bgMusic.play().catch(()=>{});
  document.body.classList.add('blurred');
  document.body.classList.add('bg-open');
  canvas.classList.add('enlarged');
  lanzarConfeti();
  destello.active = true;
  destello.t = 0;
  gsap.to(carta, {
    openProgress: 1,
    duration: 1.1,
    ease: "elastic.out(1, 0.7)",
    onUpdate: () => {
      if (carta.openProgress > 0.7 && brillos.length < 8) crearBrillo();
      setCarta3D(carta.openProgress);
      // Mostrar papel3d cuando la carta esté suficientemente abierta
      if (carta.openProgress > 0.82 && !papel3d.classList.contains('visible')) {
        mostrarPapel3d();
      }
    },
    onComplete: () => {
      mostrarMensaje = true;
      iniciarAnimMensaje();
      // Animar botones
      gsap.to('#closeBtn', { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.5, delay: 0.1 });
      gsap.to('#downloadBtn', { opacity: 1, scale: 1, pointerEvents: 'auto', duration: 0.5, delay: 0.2 });
      document.getElementById('closeBtn').classList.add('visible');
      document.getElementById('downloadBtn').classList.add('visible');
      // Animar firma
      gsap.to('.firma', { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
    }
  });
  gsap.to("#cartaCanvas", { y: 0, duration: 0.2 });
}

// Restaurar tamaño y fondo al cerrar
function cerrarCarta() {
  if (!carta.opening) return;
  // --- Pausar música de fondo ---
  const bgMusic = document.getElementById('bgMusic');
  bgMusic.pause();
  gsap.to('#closeBtn', { opacity: 0, scale: 0.8, pointerEvents: 'none', duration: 0.4 });
  gsap.to('#downloadBtn', { opacity: 0, scale: 0.8, pointerEvents: 'none', duration: 0.4 });
  document.getElementById('closeBtn').classList.remove('visible');
  document.getElementById('downloadBtn').classList.remove('visible');
  document.body.classList.remove('blurred');
  document.body.classList.remove('bg-open');
  canvas.classList.remove('enlarged');
  mostrarMensaje = false;
  if (mensajeAnim.timer) clearInterval(mensajeAnim.timer);
  const closeSound = document.getElementById('closeSound');
  closeSound.currentTime = 0.18;
  closeSound.volume = 0.23;
  closeSound.play();
  ocultarPapel3d();
  gsap.to(carta, {
    openProgress: 0,
    duration: 0.7,
    ease: "power2.inOut",
    onUpdate: () => {
      setCarta3D(carta.openProgress);
    },
    onComplete: () => {
      carta.opening = false;
      document.getElementById('subtitle').style.opacity = 1;
      // Animar firma fuera
      gsap.to('.firma', { opacity: 0.7, y: 18, duration: 0.7, ease: "power2.in" });
    }
  });
  gsap.to("#cartaCanvas", { y: 0, duration: 0.2 });
  setTimeout(animarBounceSobre, 900);
}

// Descargar carta como imagen con feedback visual
document.getElementById('downloadBtn').addEventListener('click', () => {
  setTimeout(() => {
    const link = document.createElement('a');
    link.download = 'carta.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    // Mostrar mensaje de descargado con animación
    const msg = document.getElementById('downloadMsg');
    gsap.to(msg, { opacity: 1, scale: 1.1, duration: 0.3 });
    setTimeout(() => {
      gsap.to(msg, { opacity: 0, scale: 1, duration: 0.5 });
    }, 1300);
    // Efecto de partículas al descargar
    lanzarConfeti();
  }, 200);
});

// Responsive canvas
function resizeCanvas() {
  const ratio = 5/4;
  let w = Math.min(window.innerWidth * 0.95, 600);
  let h = w / ratio;
  if (h > window.innerHeight * 0.8) {
    h = window.innerHeight * 0.8;
    w = h * ratio;
  }
  canvas.width = w;
  canvas.height = h;
  carta.x = w*0.2;
  carta.y = h*0.25;
  carta.w = w*0.6;
  carta.h = h*0.45;
  carta.flapHeight = carta.h*0.33;
  // Ajusta el canvas de fondo
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

canvas.addEventListener('click', abrirCarta);
document.getElementById('closeBtn').addEventListener('click', cerrarCarta);

animar();

// --- Animación de rebote para llamar la atención ---
function animarBounceSobre() {
  if (!carta.opening && carta.openProgress === 0) {
    gsap.to("#cartaCanvas", {
      y: -18,
      duration: 0.38,
      ease: "power1.inOut",
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        setTimeout(animarBounceSobre, 1200);
      }
    });
  } else {
    gsap.to("#cartaCanvas", { y: 0, duration: 0.2 });
  }
}

// --- 3D carta: animación de rotación y profundidad ---
function setCarta3D(progress) {
  // progress: 0 (cerrada) a 1 (abierta)
  const cartaEl = document.getElementById('cartaCanvas');
  const rotY = -10 + 20 * progress; // de -10deg a +10deg
  const rotX = -18 + 30 * progress; // de -18deg a +12deg
  cartaEl.style.transform = `perspective(900px) scale(${progress > 0.7 ? 1.18 : 1}) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
  cartaEl.style.boxShadow = progress > 0.7
    ? "0 24px 64px 0 rgba(230,57,70,0.22), 0 0 0 12px #fffbe8"
    : "0 8px 32px rgba(0,0,0,0.18)";
}

// Animación de entrada de la carta
gsap.fromTo(
  "#cartaCanvas",
  { y: -120, opacity: 0 },
  { y: 0, opacity: 1, duration: 1.2, ease: "bounce.out", delay: 0.2,
    onComplete: animarBounceSobre // Iniciar rebote después de la entrada
  }
);

// Tooltip en botón cerrar (ya está en CSS, solo para touch)
const closeBtn = document.getElementById('closeBtn');
const closeTooltip = document.getElementById('closeTooltip');
closeBtn.addEventListener('touchstart', () => {
  closeTooltip.style.visibility = 'visible';
  closeTooltip.style.opacity = '1';
});
closeBtn.addEventListener('touchend', () => {
  setTimeout(() => {
    closeTooltip.style.visibility = '';
    closeTooltip.style.opacity = '';
  }, 800);
});

// Accesibilidad: abrir/cerrar con teclado
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Enter') {
    if (!carta.opening) abrirCarta();
    else if (mostrarMensaje) cerrarCarta();
  }
  if (e.code === 'Escape' && carta.opening && mostrarMensaje) cerrarCarta();
});

// Instrucción móvil
function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}
window.addEventListener('DOMContentLoaded', () => {
  setCarta3D(0);
  gsap.set('.firma', { opacity: 0.7, y: 18 });
  positionPapel3d();
  if (isMobile()) {
    document.getElementById('subtitle').textContent = "Toca la carta para abrirla";
  }
});

// --- Asegura que el rebote empiece siempre, incluso si la animación de entrada no se ejecuta ---
animarBounceSobre();