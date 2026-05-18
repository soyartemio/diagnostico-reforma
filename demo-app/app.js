const state = {
  dashboard: null,
  purchases: [],
  selectedPurchaseId: null,
  selectedKpiId: "inventario",
  selectedAnomalyId: "var-precio",
  intelMode: "brief",
  decisions: {},
  resolvedAnomalies: {},
  activity: [],
  completionMessage: "",
  tourStep: null
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

const views = {
  dashboard: { title: "Dashboard ejecutivo", kicker: "Centro de mando", el: "dashboardView" },
  ventas: { title: "Ventas", kicker: "Pedidos y cotizaciones", el: "ventasView" },
  compras: { title: "Compras y autorizaciones", kicker: "Expediente playable", el: "comprasView" },
  inventario: { title: "Inventario critico", kicker: "Motivos y acciones", el: "inventarioView" },
  cxp: { title: "Cuentas por pagar", kicker: "Compromisos generados", el: "cxpView" }
};

const salesOrders = [
  {
    id: "PV-260517-2201",
    customer: "CFE Norte",
    amount: 6200000,
    margin: "31%",
    status: "Embarque parcial",
    inventory: "Herrajes ferroviarios",
    eta: "Miércoles",
    risk: "Requiere certificado anexo"
  },
  {
    id: "PV-260517-2218",
    customer: "Telecom Bajio",
    amount: 3100000,
    margin: "28%",
    status: "Listo para surtir",
    inventory: "Pino dimensionado",
    eta: "Viernes",
    risk: "Sin alerta de cobranza"
  },
  {
    id: "PV-260517-2234",
    customer: "Constructoras regionales",
    amount: 1900000,
    margin: "35%",
    status: "Cotizacion ganada",
    inventory: "Tratamiento CCA",
    eta: "Por confirmar",
    risk: "Depende de OC-260517-084"
  }
];

const salesQuotes = [
  { id: "COT-260517-410", customer: "Infraestructura Norte", amount: 840000, probability: "72%", stage: "Precio enviado", next: "Confirmar vigencia hoy" },
  { id: "COT-260517-418", customer: "Minera del Centro", amount: 1280000, probability: "54%", stage: "Revision tecnica", next: "Adjuntar ficha de tratamiento" },
  { id: "COT-260517-426", customer: "Logistica Ferroviaria MX", amount: 2150000, probability: "68%", stage: "Negociacion", next: "Validar herrajes e inventario" }
];

const basePayables = [
  { id: "CXP-260517-301", supplier: "Maderas Selectas del Pacifico", origin: "ERP-PO-91790", amount: 612000, due: "2026-05-22", status: "Programada" },
  { id: "CXP-260517-302", supplier: "Servicios Industriales Laguna", origin: "ERP-PO-91801", amount: 187900, due: "2026-05-19", status: "Por validar" },
  { id: "CXP-260517-303", supplier: "Transportes Sierra Madre", origin: "ERP-PO-91816", amount: 92500, due: "2026-05-21", status: "Programada" }
];

const inventoryMovements = [
  { time: "08:40", type: "Salida", item: "Solucion preservante CCA", qty: "4 tambos", ref: "PV-260517-2234" },
  { time: "10:18", type: "Reserva", item: "Pino dimensionado", qty: "380 piezas", ref: "PV-260517-2218" },
  { time: "12:05", type: "Entrada parcial", item: "Herrajes ferroviarios", qty: "24 sets", ref: "OC-260517-102" }
];

const tourSteps = [
  {
    title: "Direccion ve lo que importa hoy",
    body: "La entrada no es un menu infinito: muestra compras sensibles, inventario critico y anomalias con accion inmediata.",
    view: "dashboard"
  },
  {
    title: "Cada compra vive como expediente",
    body: "La OC se abre debajo de la tarjeta, con documentos, riesgo, proveedor, historico y decision en un solo lugar.",
    view: "compras",
    purchaseId: "OC-260517-084"
  },
  {
    title: "La decision queda explicada",
    body: "Checklist, comparativo y score de proveedor ayudan a aprobar con criterio, no por corazonada.",
    view: "compras",
    purchaseId: "OC-260517-084"
  },
  {
    title: "El sistema empuja accion",
    body: "Aprobar, rechazar, pedir aclaracion o resolver anomalias actualiza la operacion en vivo.",
    view: "dashboard"
  }
];

function getAnomalies() {
  const highRisk = state.purchases.filter((item) => item.risk === "Alto").length;
  return [
    {
      id: "var-precio",
      title: "Variacion de precio",
      text: `${highRisk} OC arriba de historico requieren explicacion.`,
      tone: "danger",
      purchaseId: "OC-260517-084",
      action: "Abrir OC y pedir aclaracion de precio."
    },
    {
      id: "inventario",
      title: "Inventario sensible",
      text: "4 SKU tienen cobertura menor a una semana.",
      tone: "watch",
      purchaseId: "OC-260517-091",
      action: "Cruzar faltantes con compras abiertas."
    },
    {
      id: "docs",
      title: "Evidencia faltante",
      text: "5 expedientes requieren ficha tecnica o certificado.",
      tone: "watch",
      purchaseId: "OC-260517-136",
      action: "Asignar responsable de documento."
    },
    {
      id: "rapidas",
      title: "Aprobacion rapida",
      text: "2 OC tienen bajo riesgo y evidencia completa.",
      tone: "good",
      purchaseId: "OC-260517-113",
      action: "Aprobar en bloque si direccion lo autoriza."
    }
  ];
}

async function loadData() {
  const [dashboard, purchases] = await Promise.all([
    fetch("data/demo-dashboard.json").then((r) => r.json()),
    fetch("data/demo-purchases.json").then((r) => r.json())
  ]);
  state.dashboard = dashboard;
  state.purchases = purchases;
  state.selectedPurchaseId = null;
}

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function setView(viewName) {
  const view = views[viewName];
  if (!view) return;

  qsa(".view").forEach((el) => el.classList.remove("active"));
  qs(`#${view.el}`).classList.add("active");
  qsa(".nav-item").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === viewName));
  qsa(".bottom-nav-item").forEach((btn) => btn.classList.toggle("active", btn.dataset.view === viewName));
  qs("#viewTitle").textContent = view.title;
  qs("#viewKicker").textContent = view.kicker;
  closeMobileNav();
}

function closeMobileNav() {
  const workspace = qs("#workspace");
  const menuBtn = qs("#mobileMenuBtn");
  const backdrop = qs("#mobileNavBackdrop");
  workspace?.classList.remove("mobile-nav-open");
  if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  if (backdrop) backdrop.hidden = true;
}

function toggleMobileNav() {
  const workspace = qs("#workspace");
  const menuBtn = qs("#mobileMenuBtn");
  const backdrop = qs("#mobileNavBackdrop");
  const isOpen = !workspace?.classList.contains("mobile-nav-open");
  workspace?.classList.toggle("mobile-nav-open", isOpen);
  if (menuBtn) menuBtn.setAttribute("aria-expanded", String(isOpen));
  if (backdrop) backdrop.hidden = !isOpen;
}

function getApprovedPurchases() {
  return state.purchases.filter((purchase) => state.decisions[purchase.id] === "Aprobada");
}

function payableFromPurchase(purchase) {
  return {
    id: `CXP-${purchase.id.replace("OC-", "")}`,
    supplier: purchase.supplier,
    origin: purchase.id,
    amount: purchase.amount,
    due: purchase.paymentTerm === "Contado" ? "2026-05-18" : purchase.paymentTerm.includes("15") ? "2026-06-01" : "2026-06-16",
    status: "Generada por aprobacion"
  };
}

function getPayables() {
  const generated = getApprovedPurchases().map(payableFromPurchase);
  return [...generated, ...basePayables];
}

function renderDashboard() {
  const { dashboard } = state;
  const pending = state.purchases.filter((purchase) => !state.decisions[purchase.id]).length;
  const done = state.purchases.length - pending;
  const progress = Math.round((done / state.purchases.length) * 100);
  if (qs("#mirrorProgress")) qs("#mirrorProgress").style.width = `${Math.max(progress, 8)}%`;
  if (qs("#mirrorScore")) qs("#mirrorScore").textContent = `${done}/${state.purchases.length}`;
  qs("#syncStamp").textContent = `${pending} compras por decidir`;

  qs("#kpiGrid").innerHTML = dashboard.kpis.map((kpi) => `
    <button class="kpi-card ${kpi.id === state.selectedKpiId ? "active" : ""}" data-kpi="${kpi.id}">
      <span>${kpi.label}</span>
      <strong>${kpi.value}</strong>
      <em class="badge ${kpi.tone}">${kpi.delta}</em>
      <small>Ver motivos</small>
    </button>
  `).join("");

  renderKpiDrilldown();
  renderIntelligence("brief");
  renderAnomalies();
  renderDecisionLog();
  renderNotifications();

  qs("#alertsList").innerHTML = dashboard.alerts.map((alert) => `
    <button class="alert-item" data-alert="${alert.id}">
      <span class="badge ${alert.priority === "Alta" ? "danger" : "watch"}">${alert.priority}</span>
      <strong>${alert.title}</strong>
      <p>${alert.text}</p>
      <small>${alert.owner} · tocar para ver accion</small>
    </button>
  `).join("");

  qs("#miniInbox").innerHTML = state.purchases.slice(0, 3).map((purchase) => `
    <button class="mini-item purchase-row" data-purchase="${purchase.id}" data-view-jump="compras">
      <div class="purchase-top">
        <strong>${purchase.id}</strong>
        <span class="badge ${toneForRisk(purchase.risk)}">${purchase.risk}</span>
      </div>
      <p>${purchase.supplier} - ${money.format(purchase.amount)}</p>
    </button>
  `).join("");

  qs("#aiDecisions").innerHTML = getTodayFocus().map((item) => `
    <button class="today-action ${item.tone}" data-${item.targetType}="${item.target}">
      <strong>${item.title}</strong>
      <span>${item.text}</span>
    </button>
  `).join("");
}

function getTodayFocus() {
  const highRisk = state.purchases.find((purchase) => purchase.risk === "Alto" && !state.decisions[purchase.id]) || state.purchases[0];
  const pending = state.purchases.filter((purchase) => !state.decisions[purchase.id]).length;
  return [
    {
      title: "Decidir compra sensible",
      text: `${highRisk.id} tiene ${highRisk.variation > 0 ? "+" : ""}${highRisk.variation}% vs historico.`,
      tone: "danger",
      targetType: "open-purchase",
      target: highRisk.id
    },
    {
      title: "Proteger inventario critico",
      text: "CCA y pino industrial requieren accion antes de nuevas promesas.",
      tone: "watch",
      targetType: "intel",
      target: "inventory"
    },
    {
      title: "Cerrar el dia con orden",
      text: `${pending} compras siguen pendientes; la bitacora conserva cada decision.`,
      tone: "good",
      targetType: "view-jump",
      target: "compras"
    }
  ];
}

function getNotifications() {
  const pendingHigh = state.purchases.filter((purchase) => purchase.risk === "Alto" && !state.decisions[purchase.id]);
  const openAnomalies = getAnomalies().filter((item) => !state.resolvedAnomalies[item.id]);
  const generatedPayables = getApprovedPurchases().length;
  return [
    {
      title: `${pendingHigh.length} OC de alto riesgo`,
      text: "Revisar variacion, evidencia y flujo antes de aprobar.",
      action: "Abrir compras",
      target: pendingHigh[0]?.id || state.purchases[0]?.id
    },
    {
      title: `${openAnomalies.length} anomalias abiertas`,
      text: "El radar prioriza costo, inventario y documentos.",
      action: "Ver radar",
      target: "dashboard"
    },
    {
      title: "Inventario bajo vigilancia",
      text: "La cobertura critica ya esta ligada a compras pendientes.",
      action: "Ver inventario",
      target: "inventario"
    },
    {
      title: `${generatedPayables} CxP generadas hoy`,
      text: "Las compras aprobadas ya aparecen como compromiso financiero.",
      action: "Ver CxP",
      target: "cxp"
    }
  ];
}

function renderNotifications() {
  const notifications = getNotifications();
  const count = qs("#notifyCount");
  const panel = qs("#notificationPanel");
  if (!count || !panel) return;
  count.textContent = notifications.length;
  panel.innerHTML = notifications.map((note) => `
    <button class="notification-item" data-notification-target="${note.target}">
      <strong>${note.title}</strong>
      <span>${note.text}</span>
      <em>${note.action}</em>
    </button>
  `).join("");
}

function getSearchResults(query) {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  const purchaseResults = state.purchases
    .filter((purchase) => [
      purchase.id,
      purchase.supplier,
      purchase.category,
      purchase.requestedBy,
      ...purchase.items.map((item) => `${item.sku} ${item.name}`)
    ].join(" ").toLowerCase().includes(term))
    .slice(0, 5)
    .map((purchase) => ({
      type: "OC",
      title: `${purchase.id} · ${purchase.supplier}`,
      text: `${money.format(purchase.amount)} · riesgo ${purchase.risk}`,
      command: `purchase:${purchase.id}`
    }));

  const inventoryResults = state.dashboard.inventory
    .filter((item) => `${item.sku} ${item.name} ${item.reason}`.toLowerCase().includes(term))
    .slice(0, 3)
    .map((item) => ({
      type: "SKU",
      title: `${item.sku} · ${item.name}`,
      text: `${item.coverage} · ${item.impact}`,
      command: "view:inventario"
    }));

  const alertResults = state.dashboard.alerts
    .filter((alert) => `${alert.title} ${alert.text} ${alert.owner}`.toLowerCase().includes(term))
    .slice(0, 3)
    .map((alert) => ({
      type: "Alerta",
      title: alert.title,
      text: alert.text,
      command: "view:dashboard"
    }));

  const salesResults = [...salesOrders, ...salesQuotes]
    .filter((item) => `${item.id} ${item.customer} ${item.status || item.stage}`.toLowerCase().includes(term))
    .slice(0, 3)
    .map((item) => ({
      type: item.id.startsWith("PV") ? "Venta" : "Cot",
      title: `${item.id} · ${item.customer}`,
      text: `${money.format(item.amount)} · ${item.status || item.stage}`,
      command: "view:ventas"
    }));

  const payableResults = getPayables()
    .filter((item) => `${item.id} ${item.supplier} ${item.origin}`.toLowerCase().includes(term))
    .slice(0, 3)
    .map((item) => ({
      type: "CxP",
      title: `${item.id} · ${item.supplier}`,
      text: `${money.format(item.amount)} · ${item.status}`,
      command: "view:cxp"
    }));

  return [...purchaseResults, ...inventoryResults, ...salesResults, ...payableResults, ...alertResults].slice(0, 7);
}

function renderCommandResults(query) {
  const panel = qs("#commandResults");
  if (!panel) return;
  const results = getSearchResults(query);
  if (!query.trim()) {
    panel.hidden = true;
    panel.innerHTML = "";
    return;
  }
  panel.hidden = false;
  panel.innerHTML = results.length
    ? results.map((result) => `
      <button class="command-result" data-command="${result.command}">
        <i>${result.type}</i>
        <strong>${result.title}</strong>
        <span>${result.text}</span>
      </button>
    `).join("")
    : `<div class="command-empty">Sin resultados. Prueba con proveedor, OC o SKU.</div>`;
}

function runCommand(command) {
  const [type, value] = command.split(":");
  if (type === "purchase") {
    state.selectedPurchaseId = value;
    setView("compras");
    renderPurchases();
    showToast(`Abriendo ${value}`);
  }
  if (type === "view") {
    setView(value);
    showToast(`Abriendo ${views[value]?.title || value}`);
  }
  const search = qs("#globalSearch");
  const panel = qs("#commandResults");
  if (search) search.value = "";
  if (panel) panel.hidden = true;
}

function showTourStep(index = 0) {
  state.tourStep = index;
  const step = tourSteps[state.tourStep];
  if (!step) {
    closeTour();
    return;
  }
  if (step.purchaseId) state.selectedPurchaseId = step.purchaseId;
  if (step.view) setView(step.view);
  renderPurchases();
  renderDashboard();
  renderInventory();
  renderTour();
}

function renderTour() {
  const overlay = qs("#tourOverlay");
  if (!overlay) return;
  const step = state.tourStep === null ? null : tourSteps[state.tourStep];
  overlay.hidden = !step;
  if (!step) return;
  qs("#tourStepLabel").textContent = `${state.tourStep + 1} de ${tourSteps.length}`;
  qs("#tourTitle").textContent = step.title;
  qs("#tourBody").textContent = step.body;
  const next = qs("[data-tour-next]");
  if (next) next.textContent = state.tourStep === tourSteps.length - 1 ? "Terminar" : "Siguiente";
}

function closeTour() {
  state.tourStep = null;
  renderTour();
}

function renderPurchases() {
  const pending = state.purchases.filter((purchase) => !state.decisions[purchase.id]);
  const resolved = state.purchases.filter((purchase) => state.decisions[purchase.id]);
  qs("#purchaseList").innerHTML = `
    <div class="list-section-title">
      <span>Pendientes</span>
      <strong>${pending.length}</strong>
    </div>
    ${pending.length ? renderPurchaseRows(pending) : `<div class="empty-state premium-empty"><strong>Todo limpio por ahora.</strong><span>Las decisiones tomadas se movieron a Resuelto hoy y la bitacora quedo actualizada.</span></div>`}
    <div class="list-section-title resolved-title">
      <span>Resuelto hoy</span>
      <strong>${resolved.length}</strong>
    </div>
    ${resolved.length ? renderPurchaseRows(resolved) : `<div class="empty-state">Aun no hay compras resueltas. Toma una decision para verlas aqui.</div>`}
  `;

  renderPurchaseDetail();
  renderDecisionLog();
  renderCompletionBanner();
}

function renderPurchaseRows(items) {
  if (!items.length) return "";
  return items.map((purchase) => {
    const decision = state.decisions[purchase.id] || purchase.status;
    return `
    <button class="purchase-row ${purchase.id === state.selectedPurchaseId ? "active" : ""}" data-purchase="${purchase.id}">
      <div class="purchase-top">
        <strong>${purchase.id}</strong>
        <span class="badge ${decisionTone(decision)}">${decision}</span>
      </div>
      <p>${purchase.supplier}</p>
      <div class="money-row">
        <b>${money.format(purchase.amount)}</b>
        <span>${purchase.variation > 0 ? "+" : ""}${purchase.variation}% vs historico</span>
      </div>
    </button>
    ${purchase.id === state.selectedPurchaseId ? `<div class="inline-purchase-detail">${purchaseDetailMarkup(purchase, decision)}</div>` : ""}
  `;
  }).join("");
}

function getSelectedPurchase() {
  return state.purchases.find((item) => item.id === state.selectedPurchaseId) || null;
}

function renderCompletionBanner() {
  const banner = qs("#completionBanner");
  if (!banner) return;
  if (!state.completionMessage) {
    banner.classList.remove("show");
    banner.innerHTML = "";
    return;
  }
  const showCxp = state.completionMessage.includes("CxP");
  banner.innerHTML = `<strong>Listo</strong><span>${state.completionMessage}</span>${showCxp ? `<button class="banner-link" data-view-jump="cxp">Ver CxP</button>` : ""}`;
  banner.classList.add("show");
}

function renderKpiDrilldown() {
  const kpi = state.dashboard.kpis.find((item) => item.id === state.selectedKpiId) || state.dashboard.kpis[0];
  if (!kpi) return;

  qs("#kpiDrilldown").innerHTML = `
    <div class="panel-head">
      <div>
        <p class="eyebrow">Drilldown ejecutivo</p>
        <h3>${kpi.label}: ${kpi.value}</h3>
      </div>
      <span class="badge ${kpi.tone}">${kpi.delta}</span>
    </div>
    <div class="drilldown-grid">
      <div class="why-card">
        <strong>Motivo principal</strong>
        <p>${kpi.why}</p>
      </div>
      <div class="why-card action">
        <strong>Accion sugerida</strong>
        <p>${kpi.action}</p>
      </div>
    </div>
    <div class="reason-list">
      ${kpi.items.map((item) => `<div><span></span><p>${item}</p></div>`).join("")}
    </div>
  `;
}

function renderPurchaseDetail() {
  qs("#purchaseDetail").innerHTML = "";
}

function getChecklist(purchase) {
  const hasQuote = purchase.documents.some((doc) => doc.type.toLowerCase().includes("cotizacion"));
  const hasTechnical = purchase.documents.some((doc) => /ficha|tecnica|inventario|programa|servicio|proveedor/i.test(`${doc.type} ${doc.title}`));
  const priceOk = purchase.variation <= 5;
  const cashOk = purchase.amount < 450000 || purchase.paymentTerm !== "Contado";
  return [
    {
      label: "Cotizacion adjunta",
      detail: hasQuote ? "Evidencia disponible en expediente." : "Falta cotizacion formal.",
      status: hasQuote ? "ok" : "warn"
    },
    {
      label: "Precio contra historico",
      detail: priceOk ? "Variacion dentro de rango." : `${purchase.variation > 0 ? "+" : ""}${purchase.variation}% requiere explicacion.`,
      status: priceOk ? "ok" : "warn"
    },
    {
      label: "Soporte tecnico",
      detail: hasTechnical ? "Documento operativo ligado." : "Conviene pedir ficha o alcance.",
      status: hasTechnical ? "ok" : "warn"
    },
    {
      label: "Impacto financiero",
      detail: cashOk ? "Puede entrar a flujo normal." : "Revisar caja antes de liberar.",
      status: cashOk ? "ok" : "warn"
    }
  ];
}

function renderChecklist(purchase) {
  return `<div class="decision-checklist">
    ${getChecklist(purchase).map((item) => `
      <div class="check-item ${item.status}">
        <i>${item.status === "ok" ? "✓" : "!"}</i>
        <div>
          <strong>${item.label}</strong>
          <span>${item.detail}</span>
        </div>
      </div>
    `).join("")}
  </div>`;
}

function supplierScore(purchase) {
  const riskPenalty = purchase.risk === "Alto" ? 14 : purchase.risk === "Medio" ? 7 : 0;
  const variationPenalty = Math.max(0, purchase.variation) * 0.8;
  const documentBonus = Math.min(6, purchase.documents.length * 2);
  return Math.max(58, Math.min(96, Math.round(88 - riskPenalty - variationPenalty + documentBonus)));
}

function renderSupplierScore(purchase) {
  const score = supplierScore(purchase);
  return `
    <div class="score-ring" style="--score:${score}">
      <strong>${score}</strong>
      <span>score proveedor</span>
    </div>
    <div class="score-copy">
      <h3>${score >= 82 ? "Proveedor confiable" : score >= 70 ? "Proveedor con vigilancia" : "Revisar antes de aprobar"}</h3>
      <p>${purchase.supplier} combina historial, evidencia, variacion y criticidad de la compra.</p>
      <small>${purchase.documents.length} documentos · ${purchase.paymentTerm} · riesgo ${purchase.risk}</small>
    </div>
  `;
}

function renderQuoteOptions(purchase) {
  const current = purchase.amount;
  const historic = purchase.lastAmount;
  const negotiated = Math.round(current * (purchase.risk === "Alto" ? 0.94 : 0.98));
  const options = [
    { label: "Proveedor actual", amount: current, note: "Cotizacion recibida", tone: purchase.variation > 8 ? "danger" : "watch" },
    { label: "Ultima compra", amount: historic, note: "Referencia historica", tone: "neutral" },
    { label: "Meta negociada", amount: negotiated, note: purchase.risk === "Alto" ? "Pedir ajuste sugerido" : "Rango objetivo", tone: "good" }
  ];
  const best = options.reduce((lowest, option) => option.amount < lowest.amount ? option : lowest, options[0]);
  return options.map((option) => `
    <div class="quote-option ${option.tone} ${option.label === best.label ? "recommended" : ""}">
      <span>${option.label === best.label ? "Recomendado" : option.note}</span>
      <strong>${money.format(option.amount)}</strong>
      <small>${option.label === "Proveedor actual" ? `${purchase.variation > 0 ? "+" : ""}${purchase.variation}% vs ultima compra` : option.note}</small>
    </div>
  `).join("");
}

function purchaseDetailMarkup(purchase, decision) {
  const isDecided = decision !== "Pendiente";

  return `
    <div class="detail-top">
      <div>
        <p class="eyebrow">${purchase.category}</p>
        <h3>${purchase.supplier}</h3>
      </div>
      <span class="badge ${decisionTone(decision)}">${decision}</span>
    </div>
    <div class="amount">${money.format(purchase.amount)}</div>
    <div class="workflow-banner ${decisionTone(decision)}">
      <strong>${decision === "Pendiente" ? "Lista para decision" : `Decision tomada: ${decision}`}</strong>
      <span>${decision === "Pendiente" ? "Elige una accion abajo y se actualizan tablero, bitacora y progreso." : "Puedes cambiar la decision y el sistema recalcula el flujo."}</span>
    </div>
    <div class="detail-meta">
      <span>${purchase.erpReference}</span>
      <span>${purchase.paymentTerm}</span>
      <span>${purchase.requestedBy}</span>
      <span>${purchase.variation > 0 ? "+" : ""}${purchase.variation}% vs ultima compra</span>
    </div>
    <div class="ai-summary">
      <strong>Arbor Intelligence:</strong> ${purchase.aiSummary}
    </div>
    ${renderActionRow(purchase, isDecided)}
    <section class="decision-cockpit">
      <div class="cockpit-card checklist-card">
        <div class="panel-head compact">
          <h3>Checklist inteligente</h3>
          <span>${getChecklist(purchase).filter((item) => item.status === "ok").length}/${getChecklist(purchase).length} OK</span>
        </div>
        ${renderChecklist(purchase)}
      </div>
      <div class="cockpit-card supplier-score-card">
        ${renderSupplierScore(purchase)}
      </div>
    </section>
    <section class="quote-compare">
      <div class="panel-head">
        <h3>Comparativo de cotizaciones</h3>
        <span>Recomendacion visible</span>
      </div>
      <div class="quote-grid">
        ${renderQuoteOptions(purchase)}
      </div>
    </section>
    <section class="glr-panel">
      <div>
        <p class="eyebrow">Arbor Intelligence</p>
        <h3>${riskScore(purchase)} puntos de riesgo</h3>
        <p>${purchase.risk === "Alto" ? "Requiere explicacion antes de aprobar." : purchase.risk === "Medio" ? "Puede aprobarse si se confirma evidencia clave." : "Candidata a aprobacion rapida."}</p>
      </div>
      <div class="quick-intel">
        <button data-intel="risk">Analizar OC</button>
        <button data-intel="supplier">Mensaje proveedor</button>
        <button data-intel="cash">Impacto CxP</button>
      </div>
    </section>
    <div class="purchase-intel-output" id="purchaseIntelResult">
      ${renderIntelCard(getIntelligenceOutput(state.intelMode === "brief" ? "risk" : state.intelMode))}
    </div>
    <section>
      <div class="panel-head">
        <h3>Partidas</h3>
        <span>${purchase.items.length} conceptos</span>
      </div>
      <div class="items-table">
        ${purchase.items.map((item) => `
          <div class="item-line">
            <div><b>${item.name}</b><small>${item.sku} - ${item.qty} ${item.unit}</small></div>
            <strong>${money.format(item.price)}</strong>
          </div>
        `).join("")}
      </div>
    </section>
    <section>
      <div class="panel-head">
        <h3>Timeline</h3>
        <span>Expediente vivo</span>
      </div>
      <div class="timeline">
        ${purchase.timeline.map((event) => `
          <div><time>${event.time}</time><span><b>${event.label}</b><br>${event.by}</span></div>
        `).join("")}
      </div>
    </section>
    <section>
      <div class="panel-head">
        <h3>Documentos</h3>
      </div>
    <div class="document-grid">
        ${purchase.documents.map((doc, index) => `
          <button class="document-card" data-doc="${index}">
            <i>${doc.type}</i>
            <span>${doc.title}</span>
            <strong>${doc.issuer}</strong>
            <small>${doc.date} · Vista previa</small>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderActionRow(purchase, isDecided) {
  return `
    <div class="action-row ${isDecided ? "decided" : ""}" data-action-row="${purchase.id}">
      <button class="approve" data-action="Aprobada" ${isDecided ? "disabled" : ""}>
        <span>Aprobar</span>
        <small>Libera la compra</small>
      </button>
      <button class="clarify" data-action="Aclaracion solicitada" ${isDecided ? "disabled" : ""}>
        <span>Pedir aclaracion</span>
        <small>Solicita evidencia</small>
      </button>
      <button class="reject" data-action="Rechazada" ${isDecided ? "disabled" : ""}>
        <span>Rechazar</span>
        <small>Cierra el flujo</small>
      </button>
      ${isDecided ? `<button class="reopen-action" data-reopen-decision="${purchase.id}">Reabrir decision</button>` : ""}
    </div>
  `;
}

function openDocument(index) {
  const purchase = getSelectedPurchase();
  const doc = purchase?.documents?.[Number(index)];
  if (!doc) return;

  qs("#modalType").textContent = doc.type;
  qs("#modalTitle").textContent = doc.title;
  qs("#modalMeta").innerHTML = `<span>${purchase.id}</span><span>${doc.issuer}</span><span>${doc.date}</span>`;
  qs("#modalSummary").textContent = doc.summary;
  qs("#modalFields").innerHTML = doc.fields.map((field) => `<div>${field}</div>`).join("");
  qs("#documentModal").showModal();
}

function riskScore(purchase) {
  const base = purchase.risk === "Alto" ? 78 : purchase.risk === "Medio" ? 52 : 24;
  return Math.min(96, Math.round(base + Math.max(0, purchase.variation) * 1.2));
}

function renderIntelligence(mode = "brief") {
  state.intelMode = mode;
  const selected = getIntelligenceOutput(mode);
  const html = renderIntelCard(selected);
  const intelTarget = qs("#intelResult");
  if (intelTarget) intelTarget.innerHTML = html;
  const purchaseTarget = qs("#purchaseIntelResult");
  if (purchaseTarget) purchaseTarget.innerHTML = html;
}

function getIntelligenceOutput(mode = "brief") {
  const purchase = getSelectedPurchase() || state.purchases[0];
  const highRisk = state.purchases.filter((item) => item.risk === "Alto");
  const pending = state.purchases.filter((item) => !state.decisions[item.id]);
  const approved = Object.values(state.decisions).filter((value) => value === "Aprobada").length;

  const outputs = {
    brief: {
      title: "Brief ejecutivo generado",
      body: [
        `${pending.length} compras siguen pendientes; ${highRisk.length} son de riesgo alto.`,
        `La compra mas sensible es ${highRisk[0]?.id || purchase.id}, por variacion de costo y posible impacto operativo.`,
        `${approved} compras ya fueron aprobadas durante esta sesion.`
      ],
      cta: "Siguiente accion: revisar OC de alto riesgo y completar documentos faltantes."
    },
    risk: {
      title: `Analisis automatico de ${purchase.id}`,
      body: [
        `Riesgo calculado: ${riskScore(purchase)}/100.`,
        `Variacion contra historico: ${purchase.variation > 0 ? "+" : ""}${purchase.variation}%.`,
        `Proveedor: ${purchase.supplier}. Categoria: ${purchase.category}.`
      ],
      cta: purchase.risk === "Alto" ? "Recomendacion: pedir aclaracion antes de aprobar." : "Recomendacion: aprobar si documentos estan completos."
    },
    supplier: {
      title: "Mensaje sugerido al proveedor",
      body: [
        `Favor de confirmar soporte de precio para ${purchase.id}.`,
        `Detectamos una variacion de ${purchase.variation > 0 ? "+" : ""}${purchase.variation}% contra historico.`,
        "Adjuntar vigencia, fecha de entrega y cualquier cambio de condiciones."
      ],
      cta: "El usuario puede copiar este mensaje y enviarlo desde compras."
    },
    inventory: {
      title: "Prediccion de inventario",
      body: state.dashboard.inventory.slice(0, 3).map((item) => `${item.name}: cobertura ${item.coverage}. ${item.impact}`),
      cta: "Siguiente accion: ligar faltantes con compras abiertas."
    },
    docs: {
      title: "Documentos y evidencia",
      body: [
        "5 expedientes requieren ficha tecnica o certificado anexo.",
        "2 operaciones industriales tienen fecha limite esta semana.",
        "La vista de documentos evita correos perdidos y evidencia dispersa."
      ],
      cta: "Siguiente accion: asignar responsable y fecha limite."
    },
    cash: {
      title: "Impacto estimado en CxP",
      body: [
        `${purchase.id} agregaria ${money.format(purchase.amount)} a compromisos de pago.`,
        `Condicion de pago: ${purchase.paymentTerm}.`,
        "El sistema puede alertar si se aprueban varias compras grandes en la misma semana."
      ],
      cta: "Siguiente accion: revisar flujo semanal antes de autorizar compras altas."
    }
  };

  return outputs[mode] || outputs.brief;
}

function renderIntelCard(selected) {
  return `
    <div class="intel-result-card">
      <h4>${selected.title}</h4>
      ${selected.body.map((line) => `<p>${line}</p>`).join("")}
      <strong>${selected.cta}</strong>
    </div>
  `;
}

function renderAnomalies() {
  const anomalies = getAnomalies();
  const open = anomalies.filter((item) => !state.resolvedAnomalies[item.id]);
  const resolved = anomalies.filter((item) => state.resolvedAnomalies[item.id]);
  qs("#anomalyCount").textContent = `${open.length} abiertas`;
  qs("#anomalyList").innerHTML = `
    <div class="list-section-title anomaly-section-title">
      <span>Abiertas</span>
      <strong>${open.length}</strong>
    </div>
    ${renderAnomalyRows(open)}
    <div class="list-section-title anomaly-section-title resolved-title">
      <span>Resueltas hoy</span>
      <strong>${resolved.length}</strong>
    </div>
    ${resolved.length ? renderAnomalyRows(resolved) : `<div class="empty-state">Sin anomalías resueltas todavía.</div>`}
  `;

  const selected = anomalies.find((item) => item.id === state.selectedAnomalyId) || open[0] || resolved[0];
  if (!selected) return;
  const related = state.purchases.find((item) => item.id === selected.purchaseId);
  qs("#anomalyDetail").innerHTML = `
    <div class="anomaly-detail-card">
      <p class="eyebrow">${selected.title}</p>
      <h4>${selected.action}</h4>
      <p>${selected.text}</p>
      <div class="anomaly-actions">
        <button class="secondary-action" data-open-purchase="${selected.purchaseId}">Ver ${selected.purchaseId}</button>
        <button class="primary-mini-action" data-resolve-anomaly="${selected.id}">${state.resolvedAnomalies[selected.id] ? "Reabrir" : "Marcar resuelta"}</button>
        <button class="secondary-action" data-intel="${selected.id === "docs" ? "docs" : selected.id === "inventario" ? "inventory" : "risk"}">Analizar</button>
      </div>
      <small>${related ? `${related.supplier} · ${money.format(related.amount)}` : "Sin OC ligada"}</small>
    </div>
  `;
}

function renderAnomalyRows(items) {
  return items.map((item) => {
    const resolved = state.resolvedAnomalies[item.id];
    return `
      <button class="anomaly-row ${item.id === state.selectedAnomalyId ? "active" : ""} ${resolved ? "resolved" : ""}" data-anomaly="${item.id}">
        <span class="badge ${resolved ? "good" : item.tone}">${resolved ? "Resuelta" : item.title}</span>
        <strong>${item.text}</strong>
      </button>
    `;
  }).join("");
}

function renderDecisionLog() {
  const log = qs("#decisionLog");
  if (!log) return;
  const entries = state.activity.length ? state.activity : [
    { text: "Aun no hay decisiones. Aprueba, rechaza o pide aclaracion en una OC.", time: "Ahora" }
  ];
  log.innerHTML = entries.slice(0, 6).map((entry) => `
    <div class="log-entry"><strong>${entry.time}</strong><span>${entry.text}</span></div>
  `).join("");
}

function showToast(message) {
  const toast = qs("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function addActivity(text) {
  state.activity.unshift({
    text,
    time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
  });
}

function renderInventory() {
  qs("#inventoryList").innerHTML = state.dashboard.inventory.map((row) => `
    <div class="table-row">
      <div>
        <strong>${row.name}</strong>
        <p>${row.sku} · cobertura ${row.coverage}</p>
        <p>${row.reason}</p>
      </div>
      <div>
        <span class="badge danger">Atencion</span>
        <p>${row.impact}</p>
        <small>${row.suggestion}</small>
      </div>
    </div>
  `).join("");

  qs("#inventoryMovements").innerHTML = inventoryMovements.map((move) => `
    <div class="movement-row">
      <time>${move.time}</time>
      <div>
        <strong>${move.type}: ${move.item}</strong>
        <span>${move.qty} · ${move.ref}</span>
      </div>
    </div>
  `).join("");

  qs("#inventoryLinkedPurchases").innerHTML = state.purchases
    .filter((purchase) => ["OC-260517-084", "OC-260517-091", "OC-260517-102"].includes(purchase.id))
    .map((purchase) => `
      <button class="linked-record" data-open-purchase="${purchase.id}">
        <strong>${purchase.id}</strong>
        <span>${purchase.supplier}</span>
        <em>${money.format(purchase.amount)} · ${state.decisions[purchase.id] || "Pendiente"}</em>
      </button>
    `).join("");
}

function renderSales() {
  const total = salesOrders.reduce((sum, order) => sum + order.amount, 0);
  qs("#salesSummary").textContent = `${salesOrders.length} pedidos · ${money.format(total)}`;
  qs("#salesOrders").innerHTML = salesOrders.map((order) => `
    <article class="record-card sales-record">
      <div class="record-top">
        <span>${order.id}</span>
        <em>${order.status}</em>
      </div>
      <h3>${order.customer}</h3>
      <div class="record-metrics">
        <strong>${money.format(order.amount)}</strong>
        <span>Margen ${order.margin}</span>
      </div>
      <p>${order.inventory} · entrega ${order.eta}</p>
      <small>${order.risk}</small>
    </article>
  `).join("");

  qs("#salesQuotes").innerHTML = salesQuotes.map((quote) => `
    <article class="record-card quote-record">
      <div class="record-top">
        <span>${quote.id}</span>
        <em>${quote.probability}</em>
      </div>
      <h3>${quote.customer}</h3>
      <div class="record-metrics">
        <strong>${money.format(quote.amount)}</strong>
        <span>${quote.stage}</span>
      </div>
      <p>${quote.next}</p>
    </article>
  `).join("");
}

function renderPayables() {
  const payables = getPayables();
  const total = payables.reduce((sum, item) => sum + item.amount, 0);
  qs("#cxpTotal").textContent = money.format(total);
  qs("#cxpCount").textContent = `${payables.length} registros`;
  qs("#payablesList").innerHTML = payables.map((item) => `
    <article class="payable-row ${item.status.includes("Generada") ? "generated" : ""}">
      <div>
        <strong>${item.id}</strong>
        <span>${item.supplier}</span>
      </div>
      <div>
        <b>${money.format(item.amount)}</b>
        <small>${item.due} · ${item.status}</small>
      </div>
      <em>${item.origin}</em>
    </article>
  `).join("");

  const buckets = [
    { label: "Hoy", amount: payables.filter((item) => item.due <= "2026-05-18").reduce((sum, item) => sum + item.amount, 0) },
    { label: "7 dias", amount: payables.filter((item) => item.due > "2026-05-18" && item.due <= "2026-05-25").reduce((sum, item) => sum + item.amount, 0) },
    { label: "Programado", amount: payables.filter((item) => item.due > "2026-05-25").reduce((sum, item) => sum + item.amount, 0) }
  ];
  qs("#cashFlowList").innerHTML = buckets.map((bucket) => `
    <div class="cash-bucket">
      <span>${bucket.label}</span>
      <strong>${money.format(bucket.amount)}</strong>
      <i style="width:${Math.max(8, Math.round((bucket.amount / Math.max(total, 1)) * 100))}%"></i>
    </div>
  `).join("");
}

function toneForRisk(risk) {
  if (risk === "Alto") return "danger";
  if (risk === "Medio") return "watch";
  return "good";
}

function decisionTone(decision) {
  if (decision === "Aprobada") return "good";
  if (decision === "Rechazada") return "danger";
  if (decision === "Aclaracion solicitada") return "watch";
  return "watch";
}

function bindEvents() {
  qs("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    qs("#loginView").classList.add("hidden");
    qs("#workspace").classList.remove("hidden");
  });

  qsa(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  qsa(".bottom-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  qs("#mobileMenuBtn")?.addEventListener("click", toggleMobileNav);
  qs("#mobileNavBackdrop")?.addEventListener("click", closeMobileNav);

  qs("#globalSearch")?.addEventListener("input", (event) => {
    renderCommandResults(event.target.value);
  });

  qs("#globalSearch")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const first = qs("#commandResults [data-command]");
    if (first) runCommand(first.dataset.command);
  });

  qs("#tourBtn")?.addEventListener("click", () => showTourStep(0));
  qs("#notifyBtn")?.addEventListener("click", () => {
    const panel = qs("#notificationPanel");
    if (panel) panel.hidden = !panel.hidden;
  });

  document.body.addEventListener("click", (event) => {
    const commandBtn = event.target.closest("[data-command]");
    if (commandBtn) {
      runCommand(commandBtn.dataset.command);
    }

    const notificationBtn = event.target.closest("[data-notification-target]");
    if (notificationBtn) {
      const target = notificationBtn.dataset.notificationTarget;
      if (target?.startsWith("OC-")) {
        state.selectedPurchaseId = target;
        setView("compras");
        renderPurchases();
      } else if (views[target]) {
        setView(target);
      }
      qs("#notificationPanel").hidden = true;
    }

    if (event.target.closest("[data-tour-close]")) closeTour();

    if (event.target.closest("[data-tour-next]")) {
      showTourStep((state.tourStep ?? 0) + 1);
    }

    const jump = event.target.closest("[data-view-jump]");
    if (jump) setView(jump.dataset.viewJump);

    const alertBtn = event.target.closest("[data-alert]");
    if (alertBtn) {
      const firstHighRisk = state.purchases.find((purchase) => purchase.risk === "Alto");
      if (firstHighRisk) {
        state.selectedPurchaseId = firstHighRisk.id;
        setView("compras");
        renderPurchases();
      }
    }

    const purchaseBtn = event.target.closest("[data-purchase]");
    if (purchaseBtn) {
      const purchaseId = purchaseBtn.dataset.purchase;
      state.selectedPurchaseId = state.selectedPurchaseId === purchaseId ? null : purchaseId;
      renderPurchases();
    }

    const kpiBtn = event.target.closest("[data-kpi]");
    if (kpiBtn) {
      state.selectedKpiId = kpiBtn.dataset.kpi;
      renderDashboard();
    }

    const docBtn = event.target.closest("[data-doc]");
    if (docBtn) {
      openDocument(docBtn.dataset.doc);
    }

    const intelBtn = event.target.closest("[data-intel]");
    if (intelBtn) {
      renderIntelligence(intelBtn.dataset.intel);
      showToast("Arbor Intelligence actualizo el analisis.");
    }

    const actionBtn = event.target.closest("[data-action]");
    if (actionBtn && state.selectedPurchaseId) {
      if (actionBtn.disabled) return;
      const purchase = getSelectedPurchase();
      const decision = actionBtn.dataset.action;
      state.decisions[state.selectedPurchaseId] = decision;
      addActivity(`${decision}: ${purchase.id} · ${purchase.supplier}`);
      if (decision === "Aprobada") {
        const payable = payableFromPurchase(purchase);
        state.completionMessage = `${purchase.id} se movió a Resuelto hoy y generó ${payable.id} en CxP.`;
        addActivity(`CxP generada: ${payable.id} · ${money.format(payable.amount)}`);
      } else {
        state.completionMessage = `${purchase.id} se movió a Resuelto hoy.`;
      }
      state.selectedPurchaseId = null;
      renderPurchases();
      renderDashboard();
      renderAnomalies();
      renderPayables();
      showToast(`${purchase.id}: ${decision}`);
      window.setTimeout(() => {
        state.completionMessage = "";
        renderCompletionBanner();
      }, 3200);
    }

    const reopenBtn = event.target.closest("[data-reopen-decision]");
    if (reopenBtn) {
      const purchase = getSelectedPurchase();
      delete state.decisions[reopenBtn.dataset.reopenDecision];
      addActivity(`Reabierta decision: ${purchase.id}`);
      renderPurchases();
      renderDashboard();
      renderPayables();
      showToast(`${purchase.id}: decision reabierta`);
    }

    const anomalyBtn = event.target.closest("[data-anomaly]");
    if (anomalyBtn) {
      state.selectedAnomalyId = anomalyBtn.dataset.anomaly;
      renderAnomalies();
    }

    const openPurchaseBtn = event.target.closest("[data-open-purchase]");
    if (openPurchaseBtn) {
      state.selectedPurchaseId = openPurchaseBtn.dataset.openPurchase;
      setView("compras");
      renderPurchases();
      showToast(`Abriendo ${state.selectedPurchaseId}`);
    }

    const resolveBtn = event.target.closest("[data-resolve-anomaly]");
    if (resolveBtn) {
      const id = resolveBtn.dataset.resolveAnomaly;
      state.resolvedAnomalies[id] = !state.resolvedAnomalies[id];
      addActivity(`${state.resolvedAnomalies[id] ? "Resuelta" : "Reabierta"} anomalia: ${getAnomalies().find((item) => item.id === id)?.title}`);
      renderDashboard();
      showToast(state.resolvedAnomalies[id] ? "Anomalia resuelta." : "Anomalia reabierta.");
    }
  });

  qs("#resetBtn").addEventListener("click", () => {
    state.decisions = {};
    state.resolvedAnomalies = {};
    state.activity = [];
    state.completionMessage = "";
    state.tourStep = null;
    state.selectedPurchaseId = null;
    state.selectedKpiId = "inventario";
    state.selectedAnomalyId = "var-precio";
    renderAll();
    setView("dashboard");
  });

  qs("#modalClose").addEventListener("click", () => qs("#documentModal").close());
  qs("#documentModal").addEventListener("click", (event) => {
    if (event.target.id === "documentModal") qs("#documentModal").close();
  });
}

function setupPwaInstall() {
  let promptEvent;
  const btn = qs("#installBtn");
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    promptEvent = event;
    btn.hidden = false;
  });
  btn.addEventListener("click", async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    promptEvent = null;
    btn.hidden = true;
  });
}

function renderAll() {
  renderDashboard();
  renderPurchases();
  renderInventory();
  renderSales();
  renderPayables();
  renderIntelligence("brief");
  renderAnomalies();
  renderDecisionLog();
  renderNotifications();
  renderTour();
}

async function init() {
  await loadData();
  bindEvents();
  setupPwaInstall();
  renderAll();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

init();
