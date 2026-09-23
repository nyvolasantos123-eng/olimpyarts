const $ = (q, c=document) => c.querySelector(q);
const $$ = (q, c=document) => [...c.querySelectorAll(q)];

$("#year").textContent = new Date().getFullYear();

/* =========================
   Gate + ambient landscape audio
   ========================= */
const gate = $("#experienceGate");
const enter = $("#enterExperience");
const soundToggle = $("#soundToggle");
const ambientAudio = $("#ambientAudio");
let audioPlaying = false;

if (ambientAudio) {
  ambientAudio.volume = 0.08;
}

function paintSoundState(on, unavailable=false) {
  audioPlaying = !!on;
  soundToggle?.classList.toggle("playing", audioPlaying);
  soundToggle?.setAttribute("aria-pressed", String(audioPlaying));
  const label = soundToggle?.querySelector("span:last-child");
  if (label) label.textContent = unavailable ? "SOM —" : (audioPlaying ? "SOM ON" : "SOM OFF");
}

async function startAmbient() {
  if (!ambientAudio || audioPlaying) return;
  try {
    await ambientAudio.play();
    paintSoundState(true);
  } catch (err) {
    paintSoundState(false, true);
    console.warn("Áudio ambiente não pôde ser iniciado:", err);
  }
}

function stopAmbient() {
  if (!ambientAudio) return;
  ambientAudio.pause();
  paintSoundState(false);
}

enter?.addEventListener("click", async () => {
  gate?.classList.add("hidden");
  await startAmbient();
});

soundToggle?.addEventListener("click", async () => {
  if (audioPlaying) stopAmbient();
  else await startAmbient();
});

ambientAudio?.addEventListener("error", () => paintSoundState(false, true));
paintSoundState(false);

/* Menu */
const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");
menuToggle?.addEventListener("click", () => {
  const open = navLinks?.classList.toggle("open");
  document.body.classList.toggle("menu-open", !!open);
  menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
});
$$(".nav-links a").forEach(a => a.addEventListener("click", () => {
  navLinks?.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
}));

/* Reveal */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = Number(entry.target.dataset.delay || 0);
    setTimeout(() => entry.target.classList.add("in"), delay);
    revealObserver.unobserve(entry.target);
  });
}, {threshold: .12});
$$(".reveal").forEach(el => revealObserver.observe(el));

/* Counters */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const start = performance.now();
    const duration = 1200;
    const suffix = target === 360 ? "°" : target === 24 ? "h" : target === 7 ? "/7" : "×";
    function tick(t) {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, {threshold: .4});
$$("[data-count]").forEach(el => counterObserver.observe(el));

/* Mouse spotlight + golden trail — preservado da versão Hardcore */
const orb = $("#goldOrb");
const trailLayer = $("#trailLayer");
let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
let lastTrail = 0;
window.addEventListener("mousemove", e => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (orb) orb.style.transform = `translate(${mouseX - 280}px,${mouseY - 280}px)`;
  const now = performance.now();
  if (trailLayer && now - lastTrail > 24 && matchMedia("(pointer:fine)").matches) {
    lastTrail = now;
    const dot = document.createElement("i");
    dot.className = "trail-dot";
    const size = 5 + Math.random() * 13;
    dot.style.width = size + "px";
    dot.style.height = size + "px";
    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
    trailLayer.appendChild(dot);
    setTimeout(() => dot.remove(), 900);
  }
});

/* 3D tilt + magnetic */
if (matchMedia("(pointer:fine)").matches) {
  $$('[data-tilt]').forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(1100px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-3px)`;
    });
    card.addEventListener("mouseleave", () => card.style.transform = "");
  });

  function bindMagnetic(btn) {
    if (btn.dataset.magneticBound) return;
    btn.dataset.magneticBound = "1";
    btn.addEventListener("mousemove", e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * .07}px,${y * .10}px)`;
    });
    btn.addEventListener("mouseleave", () => btn.style.transform = "");
  }
  $$(".magnetic").forEach(bindMagnetic);
}

/* Particle canvas */
const canvas = $("#particleCanvas");
const ctx = canvas?.getContext("2d");
let particles = [];
function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(85, Math.floor(innerWidth / 18));
  particles = Array.from({length: count}, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .12,
    r: .4 + Math.random() * 1.2, a: .08 + Math.random() * .28
  }));
}
function drawParticles() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = innerWidth; if (p.x > innerWidth) p.x = 0;
    if (p.y < 0) p.y = innerHeight; if (p.y > innerHeight) p.y = 0;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(215,177,71,${p.a})`; ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
addEventListener("resize", resizeCanvas); resizeCanvas(); drawParticles();

/* =========================
   Carrinho + checkout
   ========================= */
const TEAM_CONTACTS = [
  {name: "Leandro", number: "5511954486713"},
  {name: "Santos", number: "5511951422087"}
];
const STORAGE_KEY = "olimpy_cart_v5";
const ROUND_ROBIN_FALLBACK_KEY = "olimpy_round_robin_fallback_v1";
const ROUND_ROBIN_ENDPOINT = "/api/next-whatsapp";

// Referência promocional pública PagBank consultada em 03/09/2026.
const INSTALLMENT_RATES = {
  1: 0,
  2: 6.58,
  3: 7.08,
  4: 7.88,
  5: 8.78,
  6: 9.48,
  7: 10.24,
  8: 11.04,
  9: 11.84,
  10: 12.54,
  11: 13.24,
  12: 13.74
};
const COUPONS = {
  OLIMPY10: {type: "percent", value: 10, label: "10% OFF"},
  PRIMEIRA5: {type: "percent", value: 5, label: "5% OFF"}
};
const EXTRA_PRODUCTS = {
  maintenance: {id: "maintenance", name: "Manutenção Contínua", price: 120, cycle: "mensal"}
};

async function getNextWhatsAppContact() {
  try {
    const response = await fetch(ROUND_ROBIN_ENDPOINT, {
      method: "POST",
      headers: {"Accept": "application/json", "Content-Type": "application/json"},
      body: JSON.stringify({source: "olimpy-site"}),
      cache: "no-store"
    });
    if (response.ok) {
      const data = await response.json();
      if (data?.number) return {name: data.name || "Equipe Olimpy", number: String(data.number)};
    }
  } catch (err) {
    console.warn("Rodízio global indisponível; usando fallback local.", err);
  }

  let index = 0;
  try { index = Number(localStorage.getItem(ROUND_ROBIN_FALLBACK_KEY) || 0) % TEAM_CONTACTS.length; } catch (_) {}
  const contact = TEAM_CONTACTS[index] || TEAM_CONTACTS[0];
  try { localStorage.setItem(ROUND_ROBIN_FALLBACK_KEY, String((index + 1) % TEAM_CONTACTS.length)); } catch (_) {}
  return contact;
}

/*
 * WhatsApp — envio reconstruído do zero.
 * Emojis são criados por escapes Unicode ASCII e a mensagem inteira é
 * codificada UMA única vez com encodeURIComponent, como no projeto antigo.
 */
const EMOJI = Object.freeze({
  star: "\u2B50",
  sparkle: "\u2728",
  person: "\uD83D\uDC64",
  building: "\uD83C\uDFE2",
  phone: "\uD83D\uDCF1",
  instagram: "\uD83D\uDCF8",
  pin: "\uD83D\uDCCC",
  cart: "\uD83D\uDED2",
  money: "\uD83D\uDCB8",
  card: "\uD83D\uDCB3",
  target: "\uD83C\uDFAF",
  note: "\uD83D\uDCDD",
  wave: "\uD83D\uDC4B",
  bulb: "\uD83D\uDCA1"
});

function buildWhatsAppUrl(number, message) {
  const cleanNumber = String(number || "").replace(/\D/g, "");
  const cleanMessage = String(message || "").normalize("NFC");
  // Abre o endpoint final do WhatsApp diretamente. Evita o redirecionamento
  // wa.me -> api.whatsapp.com que pode corromper emojis em alguns fluxos do WhatsApp Web.
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(cleanMessage)}&type=phone_number&app_absent=0`;
}


function openEncodedWhatsAppUrl(url) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function getLocalRoundRobinContact() {
  let index = 0;
  try { index = Number(localStorage.getItem(ROUND_ROBIN_FALLBACK_KEY) || 0) % TEAM_CONTACTS.length; } catch (_) {}
  const contact = TEAM_CONTACTS[index] || TEAM_CONTACTS[0];
  try { localStorage.setItem(ROUND_ROBIN_FALLBACK_KEY, String((index + 1) % TEAM_CONTACTS.length)); } catch (_) {}
  return contact;
}

async function openWhatsAppRoundRobin(message, reservedContact = null) {
  // Em arquivo local, usa exatamente o fluxo simples e direto que já funcionou:
  // monta -> encodeURIComponent -> window.open(wa.me).
  if (location.protocol === "file:") {
    const contact = reservedContact || getLocalRoundRobinContact();
    const url = buildWhatsAppUrl(contact.number, message);
    openEncodedWhatsAppUrl(url);
    return contact;
  }

  // Em produção, preserva o rodízio global e abre diretamente o endpoint final
  // do WhatsApp, sem passar pelo encurtador wa.me.
  const contact = reservedContact || await getNextWhatsAppContact();
  const url = buildWhatsAppUrl(contact.number, message);
  openEncodedWhatsAppUrl(url);
  return contact;
}

const money = value => new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"}).format(Number(value || 0));
let cart = [];
let activeCoupon = null;
let paymentMethod = "pix";
let installments = 1;
let pendingWhatsAppMessage = "";
let pendingWhatsAppContact = null;

const drawer = $("#cartDrawer");
const overlay = $("#cartOverlay");
const itemsEl = $("#cartItems");
const subtotalEl = $("#cartSubtotal");
const discountEl = $("#cartDiscount");
const discountLine = $("#discountLine");
const feeEl = $("#cartFee");
const feeLine = $("#feeLine");
const finalTotalEl = $("#cartFinalTotal");
const installmentBox = $("#installmentBox");
const installmentSelect = $("#installmentSelect");
const installmentDetail = $("#installmentDetail");
const summaryInstallment = $("#summaryInstallment");
const finishBtn = $("#finishOrder");
const couponInput = $("#couponInput");
const couponFeedback = $("#couponFeedback");

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(parsed)) cart = parsed.filter(item => item && item.id && Number(item.price) >= 0);
  } catch (_) { cart = []; }
}
function saveCart() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (_) {} }
function cssSafe(value) { return window.CSS?.escape ? CSS.escape(value) : String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&"); }
function getCatalogProduct(id) {
  if (EXTRA_PRODUCTS[id]) return {...EXTRA_PRODUCTS[id]};
  const card = $(`.shop-card[data-product-id="${cssSafe(id)}"]`);
  if (!card) return null;
  return {id, name: card.dataset.productName, price: Number(card.dataset.productPrice), cycle: card.dataset.productCycle || "único"};
}
function addProduct(product, openAfter=false) {
  if (!product) return;
  const current = cart.find(item => item.id === product.id);
  if (current) current.qty += 1; else cart.push({...product, qty: 1});
  saveCart(); renderCart();
  const card = $(`.shop-card[data-product-id="${cssSafe(product.id)}"]`);
  const btn = card?.querySelector(".add-cart-btn");
  if (btn) {
    const old = btn.innerHTML; btn.classList.add("added"); btn.innerHTML = "Adicionado ✓";
    setTimeout(() => { btn.classList.remove("added"); btn.innerHTML = old; }, 900);
  }
  if (openAfter) openCart();
}
function removeProduct(id) { cart = cart.filter(item => item.id !== id); saveCart(); renderCart(); }
function setQty(id, nextQty) {
  const item = cart.find(item => item.id === id); if (!item) return;
  item.qty = Math.max(0, Number(nextQty || 0));
  if (item.qty <= 0) removeProduct(id); else { saveCart(); renderCart(); }
}
function totals() {
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  let discount = 0;
  if (activeCoupon && COUPONS[activeCoupon]) discount = subtotal * (COUPONS[activeCoupon].value / 100);
  const afterDiscount = Math.max(0, subtotal - discount);
  const rate = paymentMethod === "credit" ? Number(INSTALLMENT_RATES[installments] || 0) : 0;
  const fee = afterDiscount * (rate / 100);
  const total = afterDiscount + fee;
  return {subtotal, discount, afterDiscount, rate, fee, total};
}
function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}
function renderItems() {
  if (!itemsEl) return;
  if (!cart.length) {
    itemsEl.innerHTML = `<div class="cart-empty"><span>🛒</span><strong>Seu carrinho está vazio.</strong><p>Escolha um ou mais serviços para começar.</p></div>`;
    return;
  }
  itemsEl.innerHTML = cart.map(item => `
    <article class="cart-item" data-cart-id="${escapeHtml(item.id)}">
      <div><h4>${escapeHtml(item.name)}</h4><small>${item.cycle === "mensal" ? "serviço mensal · primeiro ciclo no total" : item.cycle === "unidade" ? "valor por unidade" : "pagamento único"}</small>
      <div class="qty-control"><button type="button" data-qty-action="minus">−</button><span>${item.qty}</span><button type="button" data-qty-action="plus">+</button></div></div>
      <div class="cart-item-price"><b>${money(item.price * item.qty)}</b><button type="button" data-remove>remover</button></div>
    </article>`).join("");
}
function renderInstallments(base) {
  if (!installmentSelect) return;
  installmentSelect.innerHTML = Object.keys(INSTALLMENT_RATES).map(n => {
    const count = Number(n), rate = Number(INSTALLMENT_RATES[count]);
    const total = base * (1 + rate / 100), each = total / count;
    const suffix = count === 1 ? "sem acréscimo" : `total ${money(total)}`;
    return `<option value="${count}">${count}x de ${money(each)} · ${suffix}</option>`;
  }).join("");
  installmentSelect.value = String(installments);
}
function renderTotals() {
  const t = totals();
  const count = cart.reduce((sum, item) => sum + Number(item.qty), 0);
  $("#heroCartCount") && ($("#heroCartCount").textContent = count);
  $("#floatingCartCount") && ($("#floatingCartCount").textContent = count);
  $("#heroCartTotal") && ($("#heroCartTotal").textContent = money(t.subtotal));
  $("#floatingCartTotal") && ($("#floatingCartTotal").textContent = money(t.subtotal));
  if (subtotalEl) subtotalEl.textContent = money(t.subtotal);
  if (finalTotalEl) finalTotalEl.textContent = money(t.total);
  if (discountLine) discountLine.hidden = !(t.discount > 0);
  if (discountEl) discountEl.textContent = `- ${money(t.discount)}`;
  if (feeLine) feeLine.hidden = !(t.fee > 0);
  if (feeEl) feeEl.textContent = money(t.fee);
  if (paymentMethod === "credit") {
    renderInstallments(t.afterDiscount);
    const each = t.total / installments;
    if (installmentDetail) installmentDetail.textContent = installments === 1
      ? `1x de ${money(t.total)} sem acréscimo na referência promocional.`
      : `${installments}x de ${money(each)} · acréscimo de ${t.rate.toFixed(2).replace(".", ",")}% · total estimado ${money(t.total)}.`;
    if (summaryInstallment) summaryInstallment.textContent = installments === 1 ? `Crédito à vista: ${money(t.total)}` : `${installments}x de ${money(each)} no crédito`;
  } else if (summaryInstallment) {
    summaryInstallment.textContent = paymentMethod === "pix" ? "Pix · valor base do pacote" : "Débito · valor confirmado no atendimento";
  }
  if (finishBtn) finishBtn.disabled = cart.length === 0;
}
function renderCart() { renderItems(); renderTotals(); }
function openCart() { drawer?.classList.add("open"); drawer?.setAttribute("aria-hidden", "false"); if (overlay) overlay.hidden = false; document.documentElement.style.overflow = "hidden"; }
function closeCart() { drawer?.classList.remove("open"); drawer?.setAttribute("aria-hidden", "true"); if (overlay) overlay.hidden = true; document.documentElement.style.overflow = ""; }
function applyCoupon() {
  const code = (couponInput?.value || "").trim().toUpperCase();
  couponFeedback?.classList.remove("error");
  if (!code) { activeCoupon = null; if (couponFeedback) couponFeedback.textContent = ""; renderTotals(); return; }
  if (!COUPONS[code]) { activeCoupon = null; if (couponFeedback) { couponFeedback.textContent = "Cupom inválido ou expirado."; couponFeedback.classList.add("error"); } renderTotals(); return; }
  activeCoupon = code; if (couponFeedback) couponFeedback.textContent = `Cupom ${code} aplicado: ${COUPONS[code].label}.`; renderTotals();
}
function setPayment(method) {
  paymentMethod = method;
  $$(".payment-option").forEach(label => label.classList.toggle("active", !!label.querySelector("input")?.checked));
  if (installmentBox) installmentBox.hidden = method !== "credit";
  if (method !== "credit") installments = 1;
  renderTotals();
}

/* Card quick 12x preview */
$$('.card-installment[data-price]').forEach(el => {
  const base = Number(el.dataset.price || 0);
  const total = base * (1 + INSTALLMENT_RATES[12] / 100);
  el.textContent = `ou 12x de ${money(total / 12)} · total est. ${money(total)}`;
});

/* Olimpy bot / welcome flow */
const botModal = $("#botModal");
function closeBot() { if (!botModal) return; botModal.hidden = true; botModal.setAttribute("aria-hidden", "true"); document.documentElement.style.overflow = ""; }
function showBot({name, company, objective, paymentDetail, totalText, itemCount}) {
  if (!botModal) return;
  const first = name.split(/\s+/)[0] || name;
  $("#botWelcome").innerHTML = `Olá, <strong>${escapeHtml(first)}</strong>! Seja muito bem-vindo(a) à Olimpy Arts. Ficamos muito felizes que você queira contar com a gente para elevar a presença da <strong>${escapeHtml(company)}</strong>.`;
  $("#botNext").innerHTML = `Seu pacote já está organizado. Ao continuar para o WhatsApp, nossa equipe recebe o briefing e o resumo do pedido. Um representante poderá criar/enviar o <strong>link do grupo de atendimento</strong>, onde vocês finalizam detalhes, pagamento e próximos passos. Lá você também poderá <strong>mandar e ouvir áudios</strong> e conversar com pessoas reais antes de fechar.`;
  $("#botOrderSummary").innerHTML = `<b>Resumo preparado</b><br>${itemCount} item(ns) selecionado(s) · ${escapeHtml(totalText)}<br>${escapeHtml(paymentDetail)}<br><span style="color:#81786b">Objetivo: ${escapeHtml(objective)}</span>`;
  botModal.hidden = false; botModal.setAttribute("aria-hidden", "false"); document.documentElement.style.overflow = "hidden";
}
async function finishOrder() {
  if (!cart.length) return;

  const name = $("#checkoutName")?.value.trim() || "";
  const company = $("#checkoutCompany")?.value.trim() || "";
  const phone = $("#checkoutPhone")?.value.trim() || "";
  const instagram = $("#checkoutInstagram")?.value.trim() || "";
  const segment = $("#checkoutSegment")?.value.trim() || "";
  const objective = $("#checkoutObjective")?.value.trim() || "";
  const notes = $("#checkoutNotes")?.value.trim() || "";

  const required = [
    [name, "#checkoutName", "seu nome"],
    [company, "#checkoutCompany", "o nome da empresa"],
    [phone, "#checkoutPhone", "seu WhatsApp"],
    [objective, "#checkoutObjective", "o que você está buscando"]
  ];
  const missing = required.find(([value]) => !value);
  if (missing) {
    alert(`Preencha ${missing[2]} para finalizar o pacote.`);
    $(missing[1])?.focus();
    return;
  }

  const t = totals();
  const paymentLabel = paymentMethod === "pix"
    ? "Pix"
    : paymentMethod === "debit"
      ? "Cartão de débito"
      : "Cartão de crédito";

  const itemLines = cart.map((item, index) => {
    const cycle = item.cycle === "mensal" ? " / mês" : item.cycle === "unidade" ? " / unidade" : "";
    return `${index + 1}. ${item.name} — ${item.qty}x ${money(item.price)}${cycle} = ${money(item.price * item.qty)}`;
  }).join("\n");

  let paymentDetail = paymentLabel;
  if (paymentMethod === "credit") {
    const each = t.total / installments;
    paymentDetail += installments === 1
      ? ` — 1x de ${money(t.total)}`
      : ` — ${installments}x de ${money(each)} (total estimado ${money(t.total)})`;
  }

  const message = [
    `${EMOJI.star} *NOVO PEDIDO — OLIMPY ARTS* ${EMOJI.star}`,
    "",
    `${EMOJI.person} *Cliente:* ${name}`,
    `${EMOJI.building} *Empresa / projeto:* ${company}`,
    `${EMOJI.phone} *WhatsApp do cliente:* ${phone}`,
    instagram ? `${EMOJI.instagram} *Instagram:* ${instagram}` : "",
    segment ? `${EMOJI.pin} *Segmento:* ${segment}` : "",
    "",
    `${EMOJI.star} *SERVIÇOS SELECIONADOS*`,
    itemLines,
    "",
    `${EMOJI.money} *Subtotal:* ${money(t.subtotal)}`,
    t.discount > 0 ? `${EMOJI.sparkle} *Desconto (${activeCoupon}):* -${money(t.discount)}` : "",
    t.fee > 0 ? `${EMOJI.card} *Acréscimo do parcelamento:* ${money(t.fee)}` : "",
    `${EMOJI.money} *TOTAL ESTIMADO:* ${money(t.total)}`,
    `${EMOJI.card} *Forma pretendida:* ${paymentDetail}`,
    "",
    `${EMOJI.target} *Objetivo do projeto:* ${objective}`,
    notes ? `${EMOJI.note} *Observações:* ${notes}` : "",
    "",
    `${EMOJI.star} Quero continuar o atendimento, alinhar os detalhes e finalizar o projeto.`
  ].filter(Boolean).join("\n");

  const btn = $("#finishOrder");
  const original = btn?.innerHTML;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "Abrindo WhatsApp…";
  }

  try {
    await openWhatsAppRoundRobin(message);
    closeCart();
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  }
}

$$(".shop-card .add-cart-btn").forEach(btn => btn.addEventListener("click", () => {
  const card = btn.closest(".shop-card"); addProduct(getCatalogProduct(card.dataset.productId));
}));
$$(".site-cart-add").forEach(btn => btn.addEventListener("click", () => addProduct(getCatalogProduct(btn.dataset.productId), true)));
$$(".maintenance-add").forEach(btn => btn.addEventListener("click", () => addProduct(getCatalogProduct(btn.dataset.productId), true)));
["openCartHero","openCartBottom","floatingCart"].forEach(id => $("#"+id)?.addEventListener("click", openCart));
$("#closeCart")?.addEventListener("click", closeCart); overlay?.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape") { if (botModal && !botModal.hidden) closeBot(); else if (drawer?.classList.contains("open")) closeCart(); } });
itemsEl?.addEventListener("click", e => {
  const itemEl = e.target.closest(".cart-item"); if (!itemEl) return;
  const id = itemEl.dataset.cartId, item = cart.find(x => x.id === id); if (!item) return;
  if (e.target.closest("[data-remove]")) removeProduct(id);
  if (e.target.closest('[data-qty-action="minus"]')) setQty(id, item.qty - 1);
  if (e.target.closest('[data-qty-action="plus"]')) setQty(id, item.qty + 1);
});
$("#applyCoupon")?.addEventListener("click", applyCoupon);
couponInput?.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } });
$$("input[name='shopPayment']").forEach(input => input.addEventListener("change", () => setPayment(input.value)));
installmentSelect?.addEventListener("change", () => { installments = Number(installmentSelect.value || 1); renderTotals(); });
finishBtn?.addEventListener("click", finishOrder);
$$('[data-close-bot]').forEach(btn => btn.addEventListener("click", closeBot));

loadCart(); renderCart(); setPayment("pix");

/* Contact form: briefing geral / pedido personalizado */
$("#leadForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const submit = form.querySelector('button[type="submit"]');
  const original = submit?.innerHTML;
  if (submit) { submit.disabled = true; submit.innerHTML = "Distribuindo atendimento…"; }

  const message = [
    `${EMOJI.star} *NOVO BRIEFING — OLIMPY ARTS* ${EMOJI.star}`,
    "",
    `${EMOJI.person} *Nome:* ${data.nome}`,
    `${EMOJI.building} *Empresa / canal:* ${data.loja}`,
    `${EMOJI.pin} *Segmento:* ${data.segmento}`,
    data.instagram ? `${EMOJI.instagram} *Instagram:* ${data.instagram}` : "",
    `${EMOJI.target} *Assunto:* ${data.plano}`,
    "",
    `${EMOJI.bulb} *O que a pessoa quer:*`,
    String(data.objetivo || "").trim(),
    "",
    `${EMOJI.star} Gostaria de saber como a Olimpy Arts pode executar esse projeto e quais seriam os próximos passos.`
  ].filter(Boolean).join("\n");

  await openWhatsAppRoundRobin(message);
  if (submit) { submit.disabled = false; submit.innerHTML = original; }
});

$("#floatingWhatsApp")?.addEventListener("click", async e => {
  e.preventDefault();
  const message = `${EMOJI.wave} Olá! Vim pelo site da *Olimpy Arts* e gostaria de tirar uma dúvida sobre um projeto. ${EMOJI.star}`;
  await openWhatsAppRoundRobin(message);
});

/* V6 corrigida — progresso de leitura, menu ativo e luz responsiva nos cards */
(() => {
  const progress = document.getElementById('navProgressBar');
  const updateProgress = () => {
    if (!progress) return;
    const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    const pct = Math.min(100, Math.max(0, scrollY / max * 100));
    progress.style.width = pct + '%';
  };
  addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (sections.length) {
    const io = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + visible.target.id));
    }, {rootMargin:'-35% 0px -55% 0px', threshold:[0,.1,.3,.6]});
    sections.forEach(s => io.observe(s));
  }

  if (matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.route-card,.shop-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
        card.style.setProperty('--my', ((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
      });
    });
  }
})();
