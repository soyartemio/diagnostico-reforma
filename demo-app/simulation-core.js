(function attachSimulation(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ArborSimulation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createArborSimulationApi() {
  const TODAY = "2026-05-22";
  const IVA = 0.16;

  const products = [
    {
      sku: "Q-CCA-1200",
      name: "Solucion preservante CCA",
      unit: "Tambor",
      opening: 34,
      min: 18,
      dailyUse: 4.8,
      category: "Tratamiento",
      impact: "Puede retrasar programas de tratamiento y pedidos industriales."
    },
    {
      sku: "Q-FIX-045",
      name: "Fijador industrial",
      unit: "Cubeta",
      opening: 52,
      min: 20,
      dailyUse: 3.1,
      category: "Tratamiento",
      impact: "Sin fijador no se libera el lote de tratamiento completo."
    },
    {
      sku: "MP-PINO-12",
      name: "Pino dimensionado clase industrial",
      unit: "Pieza",
      opening: 1280,
      min: 420,
      dailyUse: 92,
      category: "Materia prima",
      impact: "Riesgo de prometer fechas sin material suficiente."
    },
    {
      sku: "HER-FER-80",
      name: "Herrajes para embarque ferroviario",
      unit: "Set",
      opening: 116,
      min: 42,
      dailyUse: 9,
      category: "Embarques",
      impact: "Un expediente ferroviario puede quedar incompleto."
    },
    {
      sku: "POST-TEL-12",
      name: "Poste tratado telecom 12m",
      unit: "Pieza",
      opening: 760,
      min: 160,
      dailyUse: 44,
      category: "Producto terminado",
      impact: "Afecta entregas de telecomunicaciones y energia."
    },
    {
      sku: "TRV-FER-10",
      name: "Traviesa tratada ferroviaria",
      unit: "Pieza",
      opening: 540,
      min: 140,
      dailyUse: 31,
      category: "Producto terminado",
      impact: "Afecta embarques con certificado y evidencia tecnica."
    }
  ];

  const salesOrders = [
    {
      id: "PV-260303-104",
      customer: "CFE Norte",
      date: "2026-03-03",
      amount: 3260000,
      marginPct: 29,
      status: "Cobrado",
      eta: "Entregado",
      invoiceId: "FAC-2603-018",
      receivableId: "CXC-2603-018",
      items: [
        { sku: "POST-TEL-12", qty: 180 },
        { sku: "Q-CCA-1200", qty: 7 }
      ]
    },
    {
      id: "PV-260318-162",
      customer: "Logistica Ferroviaria MX",
      date: "2026-03-18",
      amount: 2140000,
      marginPct: 32,
      status: "Facturado",
      eta: "Entregado",
      invoiceId: "FAC-2603-041",
      receivableId: "CXC-2603-041",
      items: [
        { sku: "TRV-FER-10", qty: 120 },
        { sku: "HER-FER-80", qty: 28 }
      ]
    },
    {
      id: "PV-260409-220",
      customer: "Telecom Bajio",
      date: "2026-04-09",
      amount: 3100000,
      marginPct: 28,
      status: "Cobro parcial",
      eta: "Entregado parcial",
      invoiceId: "FAC-2604-072",
      receivableId: "CXC-2604-072",
      items: [
        { sku: "POST-TEL-12", qty: 220 },
        { sku: "MP-PINO-12", qty: 260 }
      ]
    },
    {
      id: "PV-260507-318",
      customer: "Constructoras regionales",
      date: "2026-05-07",
      amount: 1900000,
      marginPct: 35,
      status: "Preparando embarque",
      eta: "Viernes",
      invoiceId: "FAC-2605-117",
      receivableId: "CXC-2605-117",
      items: [
        { sku: "Q-CCA-1200", qty: 8 },
        { sku: "Q-FIX-045", qty: 12 }
      ]
    },
    {
      id: "PV-260517-2201",
      customer: "CFE Norte",
      date: "2026-05-17",
      amount: 6200000,
      marginPct: 31,
      status: "Embarque parcial",
      eta: "Miercoles",
      invoiceId: "FAC-2605-132",
      receivableId: "CXC-2605-132",
      items: [
        { sku: "POST-TEL-12", qty: 360 },
        { sku: "HER-FER-80", qty: 34 }
      ]
    }
  ];

  const salesQuotes = [
    {
      id: "COT-260517-410",
      customer: "Infraestructura Norte",
      amount: 840000,
      probability: 72,
      stage: "Precio enviado",
      next: "Confirmar vigencia hoy",
      linkedSku: "POST-TEL-12"
    },
    {
      id: "COT-260517-418",
      customer: "Minera del Centro",
      amount: 1280000,
      probability: 54,
      stage: "Revision tecnica",
      next: "Adjuntar ficha de tratamiento",
      linkedSku: "Q-CCA-1200"
    },
    {
      id: "COT-260517-426",
      customer: "Logistica Ferroviaria MX",
      amount: 2150000,
      probability: 68,
      stage: "Negociacion",
      next: "Validar herrajes e inventario",
      linkedSku: "HER-FER-80"
    },
    {
      id: "COT-260521-438",
      customer: "Energia del Noreste",
      amount: 1680000,
      probability: 61,
      stage: "Ficha tecnica",
      next: "Enviar evidencia de tratamiento",
      linkedSku: "TRV-FER-10"
    }
  ];

  const invoices = [
    {
      id: "FAC-2603-018",
      orderId: "PV-260303-104",
      customer: "CFE Norte",
      date: "2026-03-05",
      due: "2026-04-04",
      amount: 3260000,
      cfdiStatus: "Timbrada",
      uuid: "ARBOR-2603-018-CFE",
      status: "Pagada"
    },
    {
      id: "FAC-2603-041",
      orderId: "PV-260318-162",
      customer: "Logistica Ferroviaria MX",
      date: "2026-03-21",
      due: "2026-04-20",
      amount: 2140000,
      cfdiStatus: "Timbrada",
      uuid: "ARBOR-2603-041-FER",
      status: "Vencida"
    },
    {
      id: "FAC-2604-072",
      orderId: "PV-260409-220",
      customer: "Telecom Bajio",
      date: "2026-04-11",
      due: "2026-05-11",
      amount: 3100000,
      cfdiStatus: "Timbrada",
      uuid: "ARBOR-2604-072-TEL",
      status: "Parcial"
    },
    {
      id: "FAC-2605-117",
      orderId: "PV-260507-318",
      customer: "Constructoras regionales",
      date: "2026-05-09",
      due: "2026-06-08",
      amount: 1900000,
      cfdiStatus: "Timbrada",
      uuid: "ARBOR-2605-117-CON",
      status: "Por cobrar"
    },
    {
      id: "FAC-2605-132",
      orderId: "PV-260517-2201",
      customer: "CFE Norte",
      date: "2026-05-18",
      due: "2026-06-17",
      amount: 6200000,
      cfdiStatus: "Prevalidada",
      uuid: "Pendiente PAC",
      status: "En preparacion"
    }
  ];

  const receivables = [
    { id: "CXC-2603-018", invoiceId: "FAC-2603-018", customer: "CFE Norte", amount: 3260000, paid: 3260000, due: "2026-04-04", status: "Cobrado" },
    { id: "CXC-2603-041", invoiceId: "FAC-2603-041", customer: "Logistica Ferroviaria MX", amount: 2140000, paid: 1220000, due: "2026-04-20", status: "Vencida" },
    { id: "CXC-2604-072", invoiceId: "FAC-2604-072", customer: "Telecom Bajio", amount: 3100000, paid: 1700000, due: "2026-05-11", status: "Parcial" },
    { id: "CXC-2605-117", invoiceId: "FAC-2605-117", customer: "Constructoras regionales", amount: 1900000, paid: 0, due: "2026-06-08", status: "Por cobrar" },
    { id: "CXC-2605-132", invoiceId: "FAC-2605-132", customer: "CFE Norte", amount: 6200000, paid: 0, due: "2026-06-17", status: "Por facturar" }
  ];

  const basePayables = [
    { id: "CXP-260405-091", supplier: "Maderas Selectas del Pacifico", origin: "ERP-PO-91790", amount: 612000, paid: 0, due: "2026-05-22", status: "Programada" },
    { id: "CXP-260410-126", supplier: "Servicios Industriales Laguna", origin: "ERP-PO-91801", amount: 187900, paid: 0, due: "2026-05-19", status: "Por validar" },
    { id: "CXP-260414-144", supplier: "Transportes Sierra Madre", origin: "ERP-PO-91816", amount: 92500, paid: 0, due: "2026-05-21", status: "Programada" },
    { id: "CXP-260502-204", supplier: "Energia y Calderas del Norte", origin: "ERP-PO-91828", amount: 388000, paid: 0, due: "2026-05-28", status: "Autorizada" }
  ];

  const bankAccounts = [
    { id: "BAN-001", name: "Banco operativo", opening: 4650000 },
    { id: "BAN-002", name: "Reserva nomina e impuestos", opening: 1280000 }
  ];

  const baseBankMovements = [
    { id: "BAN-MOV-260305", accountId: "BAN-001", date: "2026-03-05", type: "Entrada", concept: "Cobro FAC-2603-018", amount: 3260000, origin: "CXC-2603-018" },
    { id: "BAN-MOV-260402", accountId: "BAN-001", date: "2026-04-02", type: "Salida", concept: "Pago materia prima marzo", amount: -1450000, origin: "CXP-2603-204" },
    { id: "BAN-MOV-260428", accountId: "BAN-001", date: "2026-04-28", type: "Entrada", concept: "Anticipo Telecom Bajio", amount: 1700000, origin: "CXC-2604-072" },
    { id: "BAN-MOV-260510", accountId: "BAN-001", date: "2026-05-10", type: "Salida", concept: "Pago logistica y patio", amount: -620000, origin: "CXP-2604-311" },
    { id: "BAN-MOV-260515", accountId: "BAN-002", date: "2026-05-15", type: "Salida", concept: "Reserva impuestos", amount: -480000, origin: "Tesoreria" }
  ];

  const baseInventoryMovements = [
    { date: "2026-03-04", type: "Entrada", sku: "POST-TEL-12", qty: 260, ref: "OC-260302-011", status: "Recibida" },
    { date: "2026-03-05", type: "Salida", sku: "POST-TEL-12", qty: -180, ref: "PV-260303-104", status: "Surtida" },
    { date: "2026-03-05", type: "Consumo", sku: "Q-CCA-1200", qty: -7, ref: "PV-260303-104", status: "Tratamiento" },
    { date: "2026-03-21", type: "Salida", sku: "TRV-FER-10", qty: -120, ref: "PV-260318-162", status: "Surtida" },
    { date: "2026-03-21", type: "Salida", sku: "HER-FER-80", qty: -28, ref: "PV-260318-162", status: "Surtida" },
    { date: "2026-04-11", type: "Salida", sku: "POST-TEL-12", qty: -220, ref: "PV-260409-220", status: "Surtida" },
    { date: "2026-04-11", type: "Reserva", sku: "MP-PINO-12", qty: -260, ref: "PV-260409-220", status: "Comprometida" },
    { date: "2026-05-09", type: "Consumo", sku: "Q-CCA-1200", qty: -8, ref: "PV-260507-318", status: "Tratamiento" },
    { date: "2026-05-09", type: "Consumo", sku: "Q-FIX-045", qty: -12, ref: "PV-260507-318", status: "Tratamiento" },
    { date: "2026-05-18", type: "Reserva", sku: "POST-TEL-12", qty: -360, ref: "PV-260517-2201", status: "Embarque parcial" },
    { date: "2026-05-18", type: "Reserva", sku: "HER-FER-80", qty: -34, ref: "PV-260517-2201", status: "Embarque parcial" }
  ];

  const quoteItemMap = {
    "COT-260517-410": [{ sku: "POST-TEL-12", qty: 48 }],
    "COT-260517-418": [{ sku: "Q-CCA-1200", qty: 4 }, { sku: "Q-FIX-045", qty: 6 }],
    "COT-260517-426": [{ sku: "HER-FER-80", qty: 16 }],
    "COT-260521-438": [{ sku: "TRV-FER-10", qty: 60 }]
  };

  function createSimulation(input = {}) {
    const decisions = input.decisions || {};
    const settlements = input.settlements || {};
    const salesActions = input.salesActions || {};
    const purchases = input.purchases || [];
    const generatedOrders = buildGeneratedOrders(salesActions);
    const allOrders = [...salesOrders, ...generatedOrders];
    const shipments = buildShipments(allOrders, salesActions);
    const allQuotes = buildQuotes(salesActions);
    const generatedInvoices = generatedOrders.map((order) => invoiceFromOrder(order, salesActions));
    const allInvoices = [...invoices, ...generatedInvoices];

    const approvedPurchases = purchases.filter((purchase) => decisions[purchase.id] === "Aprobada");
    const generatedPayables = approvedPurchases.map((purchase) => payableFromPurchase(purchase, settlements.payables || {}));
    const payables = [...generatedPayables, ...basePayables.map((item) => applyPayableSettlement(item, settlements.payables || {}))]
      .map((item) => ({ ...item, balance: Math.max(0, item.amount - (item.paid || 0)) }));

    const generatedReceivables = generatedOrders.map((order) => receivableFromOrder(order, salesActions, settlements.receivables || {}));
    const receivableRows = [...receivables, ...generatedReceivables].map((item) => applyReceivableSettlement(item, settlements.receivables || {}))
      .map((item) => ({ ...item, balance: Math.max(0, item.amount - (item.paid || 0)) }));

    const bankMovements = buildBankMovements(payables, receivableRows, settlements);
    const banks = bankAccounts.map((account) => {
      const movementTotal = bankMovements
        .filter((movement) => movement.accountId === account.id)
        .reduce((sum, movement) => sum + movement.amount, 0);
      return { ...account, balance: account.opening + movementTotal };
    });

    const inventoryMovements = buildInventoryMovements(approvedPurchases, generatedOrders, salesActions);
    const inventory = buildInventory(inventoryMovements, purchases, decisions);
    const enrichedOrders = allOrders.map((order) => enrichOrder(order, inventory, shipments));
    const enrichedQuotes = allQuotes.map((quote) => enrichQuote(quote, inventory));
    const invoiceRows = allInvoices.map((invoice) => enrichInvoice(invoice, receivableRows, salesActions));
    const alerts = buildAlerts({ purchases, decisions, inventory, receivables: receivableRows, payables, invoices: invoiceRows, banks });
    const kpis = buildKpis({ purchases, decisions, inventory, receivables: receivableRows, payables, invoices: invoiceRows, banks, orders: enrichedOrders });
    const events = buildEvents({ decisions, purchases, payables, receivables: receivableRows, inventoryMovements, bankMovements, shipments });
    const simulation = {
      today: TODAY,
      kpis,
      alerts,
      inventory,
      inventoryMovements: inventoryMovements.slice().sort(sortDateDesc).slice(0, 12),
      sales: { orders: enrichedOrders, quotes: enrichedQuotes },
      shipments,
      invoices: invoiceRows,
      receivables: receivableRows,
      payables,
      banks,
      bankMovements: bankMovements.slice().sort(sortDateDesc),
      events
    };

    simulation.validation = validateSimulation(simulation);
    return simulation;
  }

  function payableFromPurchase(purchase, settlementMap) {
    const id = `CXP-${purchase.id.replace("OC-", "")}`;
    const paid = settlementMap[id] ? purchase.amount : 0;
    return {
      id,
      supplier: purchase.supplier,
      origin: purchase.id,
      amount: purchase.amount,
      paid,
      due: purchase.paymentTerm === "Contado" ? TODAY : purchase.paymentTerm.includes("15") ? "2026-06-06" : "2026-06-21",
      status: paid ? "Pagada" : "Generada por aprobacion",
      source: "decision"
    };
  }

  function applyPayableSettlement(item, settlementMap) {
    if (!settlementMap[item.id]) return { ...item };
    return { ...item, paid: item.amount, status: "Pagada" };
  }

  function applyReceivableSettlement(item, settlementMap) {
    if (item.canCollect === false) return { ...item, paid: 0 };
    if (!settlementMap[item.id]) return { ...item };
    return { ...item, paid: item.amount, status: "Cobrado" };
  }

  function buildGeneratedOrders(salesActions) {
    return Object.keys(salesActions.wonQuotes || {})
      .map((quoteId) => salesQuotes.find((quote) => quote.id === quoteId))
      .filter(Boolean)
      .map((quote) => {
        const serial = quote.id.replace("COT-", "");
        return {
          id: `PV-${serial}`,
          customer: quote.customer,
          date: TODAY,
          amount: quote.amount,
          marginPct: quote.probability >= 65 ? 33 : 29,
          status: salesActions.stampedInvoices?.[`FAC-${serial}`] ? "Facturado" : "Pedido ganado",
          eta: "Programado",
          invoiceId: `FAC-${serial}`,
          receivableId: `CXC-${serial}`,
          sourceQuoteId: quote.id,
          items: quoteItemMap[quote.id] || [{ sku: quote.linkedSku, qty: 1 }]
        };
      });
  }

  function buildQuotes(salesActions) {
    return salesQuotes.map((quote) => ({
      ...quote,
      status: salesActions.wonQuotes?.[quote.id] ? "Ganada" : "Activa",
      generatedOrderId: salesActions.wonQuotes?.[quote.id] ? `PV-${quote.id.replace("COT-", "")}` : null,
      generatedInvoiceId: salesActions.wonQuotes?.[quote.id] ? `FAC-${quote.id.replace("COT-", "")}` : null
    }));
  }

  function buildShipments(orders, salesActions) {
    return orders
      .filter((order) => order.date >= "2026-05-01" || order.sourceQuoteId)
      .map((order) => {
        const shipped = Boolean(salesActions.shippedOrders?.[order.id]);
        const prepared = shipped || Boolean(salesActions.preparedShipments?.[order.id]);
        const status = shipped ? "Embarcado" : prepared ? "Preparado" : "Pendiente";
        return {
          id: `EMB-${order.id.replace("PV-", "")}`,
          orderId: order.id,
          customer: order.customer,
          invoiceId: order.invoiceId,
          amount: order.amount,
          date: shipped ? TODAY : null,
          eta: shipped ? "Liberado hoy" : prepared ? "Listo para liberar" : order.eta,
          status,
          prepared,
          shipped,
          sourceQuoteId: order.sourceQuoteId || null,
          items: order.items,
          evidence: shipped
            ? ["Remision generada", "Inventario descontado", "Expediente actualizado"]
            : prepared
              ? ["Material reservado", "Checklist listo", "Pendiente salida fisica"]
              : ["Reserva de inventario", "Pendiente preparacion", "Sin salida fisica"]
        };
      });
  }

  function invoiceFromOrder(order, salesActions) {
    const stamped = Boolean(salesActions.stampedInvoices?.[order.invoiceId]);
    return {
      id: order.invoiceId,
      orderId: order.id,
      customer: order.customer,
      date: TODAY,
      due: "2026-06-21",
      amount: order.amount,
      cfdiStatus: stamped ? "Timbrada" : "Pendiente de timbrado",
      uuid: stamped ? `ARBOR-${order.invoiceId.replace("FAC-", "")}-${order.customer.slice(0, 3).toUpperCase()}` : "Pendiente PAC",
      status: stamped ? "Por cobrar" : "Precapturada",
      sourceQuoteId: order.sourceQuoteId,
      isGenerated: true
    };
  }

  function receivableFromOrder(order, salesActions, settlementMap) {
    const stamped = Boolean(salesActions.stampedInvoices?.[order.invoiceId]);
    const paid = settlementMap[order.receivableId] && stamped ? order.amount : 0;
    return {
      id: order.receivableId,
      invoiceId: order.invoiceId,
      customer: order.customer,
      amount: order.amount,
      paid,
      due: "2026-06-21",
      status: paid ? "Cobrado" : stamped ? "Por cobrar" : "Esperando timbrado",
      canCollect: stamped,
      sourceQuoteId: order.sourceQuoteId,
      isGenerated: true
    };
  }

  function buildBankMovements(payables, receivableRows, settlements) {
    const movements = [...baseBankMovements];
    Object.keys(settlements.receivables || {}).forEach((id) => {
      const receivable = receivableRows.find((item) => item.id === id);
      if (!receivable) return;
      movements.push({
        id: `BAN-IN-${id}`,
        accountId: "BAN-001",
        date: TODAY,
        type: "Entrada",
        concept: `Cobro registrado ${receivable.invoiceId}`,
        amount: receivable.amount,
        origin: id
      });
    });
    Object.keys(settlements.payables || {}).forEach((id) => {
      const payable = payables.find((item) => item.id === id);
      if (!payable) return;
      movements.push({
        id: `BAN-OUT-${id}`,
        accountId: "BAN-001",
        date: TODAY,
        type: "Salida",
        concept: `Pago registrado ${payable.supplier}`,
        amount: -payable.amount,
        origin: id
      });
    });
    return movements;
  }

  function buildInventoryMovements(approvedPurchases, generatedOrders = [], salesActions = {}) {
    const generated = approvedPurchases.flatMap((purchase) => purchase.items
      .filter((item) => products.some((product) => product.sku === item.sku))
      .map((item) => ({
        date: "2026-05-24",
        type: "Entrada programada",
        sku: item.sku,
        qty: item.qty,
        ref: purchase.id,
        status: "Programada"
      })));
    const generatedSales = generatedOrders.flatMap((order) => order.items
      .filter((item) => products.some((product) => product.sku === item.sku))
      .map((item) => {
        const shipped = Boolean(salesActions.shippedOrders?.[order.id]);
        return {
          date: TODAY,
          type: shipped ? "Salida embarque" : "Reserva venta",
          sku: item.sku,
          qty: -item.qty,
          ref: order.id,
          status: shipped ? "Liberada" : "Pedido ganado"
        };
      }));
    return [...baseInventoryMovements, ...generated, ...generatedSales];
  }

  function buildInventory(movements, purchases, decisions) {
    return products.map((product) => {
      const skuMoves = movements.filter((movement) => movement.sku === product.sku);
      const physicalOnHand = product.opening + skuMoves
        .filter((movement) => !["Entrada programada", "Reserva", "Reserva venta"].includes(movement.type))
        .reduce((sum, movement) => sum + movement.qty, 0);
      const reserved = Math.abs(skuMoves
        .filter((movement) => ["Reserva", "Reserva venta"].includes(movement.type))
        .reduce((sum, movement) => sum + movement.qty, 0));
      const available = physicalOnHand - reserved;
      const projectedInbound = skuMoves
        .filter((movement) => movement.type === "Entrada programada")
        .reduce((sum, movement) => sum + movement.qty, 0);
      const projected = available + projectedInbound;
      const coverageDays = Math.max(0, Math.floor(projected / product.dailyUse));
      const linkedPurchases = purchases
        .filter((purchase) => purchase.items.some((item) => item.sku === product.sku))
        .map((purchase) => ({
          id: purchase.id,
          supplier: purchase.supplier,
          amount: purchase.amount,
          decision: decisions[purchase.id] || "Pendiente"
        }));
      const tone = coverageDays <= 4 ? "danger" : coverageDays <= 8 ? "watch" : "good";
      return {
        sku: product.sku,
        name: product.name,
        unit: product.unit,
        category: product.category,
        onHand: available,
        physicalOnHand,
        reserved,
        available,
        projectedInbound,
        projected,
        min: product.min,
        coverage: `${coverageDays} dias`,
        coverageDays,
        tone,
        reason: projectedInbound
          ? `${projectedInbound} ${product.unit.toLowerCase()} en entrada programada por compra aprobada.`
          : coverageDays <= 8
            ? "Cobertura sensible por ventas comprometidas y consumo reciente."
            : "Inventario dentro de rango operativo.",
        impact: product.impact,
        suggestion: linkedPurchases.length
          ? `Revisar ${linkedPurchases[0].id} (${linkedPurchases[0].decision}).`
          : "Mantener monitoreo y no prometer excedentes.",
        linkedPurchases
      };
    }).sort((a, b) => a.coverageDays - b.coverageDays);
  }

  function enrichOrder(order, inventory, shipments = []) {
    const sku = order.items[0]?.sku;
    const stock = inventory.find((item) => item.sku === sku);
    const shipment = shipments.find((item) => item.orderId === order.id);
    return {
      ...order,
      status: shipment?.status === "Embarcado" ? "Embarcado" : shipment?.status === "Preparado" && order.sourceQuoteId ? "Listo para embarque" : order.status,
      margin: `${order.marginPct}%`,
      inventory: stock?.name || "Sin SKU ligado",
      risk: stock?.tone === "danger" ? "Inventario sensible: confirmar antes de prometer" : "Sin alerta critica de inventario",
      shipmentId: shipment?.id || null,
      shipmentStatus: shipment?.status || "Sin embarque"
    };
  }

  function enrichQuote(quote, inventory) {
    const stock = inventory.find((item) => item.sku === quote.linkedSku);
    return {
      ...quote,
      probability: `${quote.probability}%`,
      stock: stock ? `${stock.name}: ${stock.coverage}` : "Sin inventario ligado",
      risk: stock?.tone || "good",
      next: quote.status === "Ganada" ? `Pedido ${quote.generatedOrderId} generado` : quote.next
    };
  }

  function enrichInvoice(invoice, receivableRows, salesActions = {}) {
    const receivable = receivableRows.find((item) => item.invoiceId === invoice.id);
    return {
      ...invoice,
      receivableStatus: receivable?.status || "Sin CxC",
      balance: receivable?.balance || 0,
      iva: Math.round(invoice.amount * IVA / (1 + IVA)),
      canStamp: invoice.cfdiStatus !== "Timbrada",
      generatedFromQuote: invoice.isGenerated || Boolean(salesActions.wonQuotes?.[invoice.sourceQuoteId])
    };
  }

  function buildAlerts({ purchases, decisions, inventory, receivables: cxcRows, payables, invoices: invoiceRows, banks }) {
    const highRisk = purchases.find((purchase) => purchase.risk === "Alto" && !decisions[purchase.id]);
    const criticalSku = inventory.find((item) => item.tone === "danger");
    const overdue = cxcRows.filter((item) => item.balance > 0 && item.due < TODAY);
    const preCfdi = invoiceRows.find((item) => item.cfdiStatus !== "Timbrada");
    const lowBank = banks.find((bank) => bank.balance < 2500000);
    return [
      highRisk && {
        id: "al-compra-riesgo",
        priority: "Alta",
        title: "Compra sensible sin decision",
        text: `${highRisk.id} con ${highRisk.variation > 0 ? "+" : ""}${highRisk.variation}% contra historico.`,
        owner: "Compras",
        target: highRisk.id
      },
      criticalSku && {
        id: "al-inventario",
        priority: "Alta",
        title: "Inventario critico con pedido comprometido",
        text: `${criticalSku.name}: cobertura ${criticalSku.coverage}. ${criticalSku.impact}`,
        owner: "Inventario",
        target: "inventario"
      },
      overdue.length && {
        id: "al-cxc",
        priority: "Alta",
        title: "CxC vencida requiere seguimiento",
        text: `${overdue.length} cuentas abiertas suman ${compactMoney(sum(overdue, "balance"))}.`,
        owner: "Finanzas",
        target: "cxc"
      },
      preCfdi && {
        id: "al-cfdi",
        priority: "Media",
        title: "Factura pendiente de timbrado",
        text: `${preCfdi.id} esta en estado ${preCfdi.cfdiStatus} y ya tiene pedido ligado.`,
        owner: "Facturacion",
        target: "facturacion"
      },
      {
        id: "al-embarques",
        priority: "Media",
        title: "Embarques pendientes de liberar",
        text: "La venta compromete inventario; la salida real se descuenta al liberar embarque.",
        owner: "Embarques",
        target: "embarques"
      },
      lowBank && {
        id: "al-bancos",
        priority: "Media",
        title: "Banco operativo bajo vigilancia",
        text: `${lowBank.name} queda en ${compactMoney(lowBank.balance)} antes de pagos nuevos.`,
        owner: "Tesoreria",
        target: "bancos"
      },
      {
        id: "al-cxp",
        priority: "Media",
        title: "Pagos proximos visibles",
        text: `${payables.filter((item) => item.balance > 0 && item.due <= "2026-05-29").length} compromisos vencen en la siguiente semana.`,
        owner: "CxP",
        target: "cxp"
      }
    ].filter(Boolean);
  }

  function buildKpis({ purchases, decisions, inventory, receivables: cxcRows, payables, invoices: invoiceRows, banks, orders }) {
    const monthSales = orders.filter((order) => order.date >= "2026-05-01").reduce((total, order) => total + order.amount, 0);
    const pendingPurchases = purchases.filter((purchase) => !decisions[purchase.id]);
    const openPurchaseAmount = pendingPurchases.reduce((total, purchase) => total + purchase.amount, 0);
    const cxcOverdue = cxcRows.filter((item) => item.balance > 0 && item.due < TODAY);
    const cxcOverdueAmount = sum(cxcOverdue, "balance");
    const cxpNext = payables.filter((item) => item.balance > 0 && item.due <= "2026-05-29");
    const cxpNextAmount = sum(cxpNext, "balance");
    const critical = inventory.filter((item) => item.tone !== "good");
    const stamped = invoiceRows.filter((invoice) => invoice.cfdiStatus === "Timbrada").length;
    return [
      {
        id: "ventas",
        label: "Ventas del mes",
        value: compactMoney(monthSales),
        delta: "+15.4%",
        tone: "good",
        why: "Los pedidos de mayo ya empujan inventario, facturacion y CxC en la simulacion.",
        items: orders.filter((order) => order.date >= "2026-05-01").map((order) => `${order.customer}: ${compactMoney(order.amount)} · ${order.status}`),
        action: "Abrir Ventas para revisar pedido, inventario y factura ligada."
      },
      {
        id: "compras",
        label: "Compras pendientes",
        value: compactMoney(openPurchaseAmount),
        delta: `${pendingPurchases.length} OC`,
        tone: pendingPurchases.length > 5 ? "watch" : "good",
        why: "Las compras aprobadas ya generan compromisos en CxP; las rechazadas no afectan flujo.",
        items: pendingPurchases.slice(0, 3).map((purchase) => `${purchase.id}: ${purchase.supplier} · ${compactMoney(purchase.amount)}`),
        action: "Resolver compras con mayor variacion o impacto de inventario."
      },
      {
        id: "cxc",
        label: "CxC vencida",
        value: compactMoney(cxcOverdueAmount),
        delta: `${cxcOverdue.length} cuentas`,
        tone: cxcOverdueAmount ? "danger" : "good",
        why: "La cartera se deriva de facturas y pagos, no de captura manual.",
        items: cxcOverdue.map((item) => `${item.customer}: ${compactMoney(item.balance)} · vence ${item.due}`),
        action: "Registrar cobro y ver entrada bancaria inmediata."
      },
      {
        id: "cxp",
        label: "CxP 7 dias",
        value: compactMoney(cxpNextAmount),
        delta: `${cxpNext.length} pagos`,
        tone: cxpNextAmount > 1000000 ? "watch" : "good",
        why: "Las OC aprobadas alimentan compromisos; pagar una CxP reduce bancos.",
        items: cxpNext.slice(0, 3).map((item) => `${item.supplier}: ${compactMoney(item.balance)} · ${item.due}`),
        action: "Programar pagos despues de revisar banco operativo."
      },
      {
        id: "inventario",
        label: "Inventario critico",
        value: `${critical.length} SKU`,
        delta: `${critical.filter((item) => item.tone === "danger").length} urgentes`,
        tone: critical.some((item) => item.tone === "danger") ? "danger" : "watch",
        why: "El stock se calcula desde entradas, salidas, reservas y compras aprobadas.",
        items: critical.slice(0, 3).map((item) => `${item.name}: ${item.coverage} · ${item.reason}`),
        action: "Abrir Inventario y ligar el faltante con OC o pedido."
      },
      {
        id: "cumplimiento",
        label: "CFDI timbrados",
        value: `${stamped}/${invoiceRows.length}`,
        delta: invoiceRows.some((invoice) => invoice.cfdiStatus !== "Timbrada") ? "1 pendiente" : "Completo",
        tone: invoiceRows.some((invoice) => invoice.cfdiStatus !== "Timbrada") ? "watch" : "good",
        why: "Facturacion conserva pedido, UUID, estado CFDI y saldo de CxC.",
        items: invoiceRows.slice(0, 3).map((invoice) => `${invoice.id}: ${invoice.cfdiStatus} · ${invoice.customer}`),
        action: "Abrir Facturacion para ver timbrado y saldo ligado."
      }
    ];
  }

  function buildEvents({ decisions, purchases, payables, receivables: cxcRows, inventoryMovements, bankMovements, shipments = [] }) {
    const decisionEvents = Object.entries(decisions).map(([id, decision]) => {
      const purchase = purchases.find((item) => item.id === id);
      return {
        date: TODAY,
        title: `${decision}: ${id}`,
        text: purchase ? purchase.supplier : "Compra ligada",
        module: "Compras"
      };
    });
    const payableEvents = payables
      .filter((item) => item.source === "decision")
      .map((item) => ({ date: item.due, title: `CxP generada ${item.id}`, text: item.supplier, module: "CxP" }));
    const cxcEvents = cxcRows
      .filter((item) => item.balance > 0)
      .slice(0, 4)
      .map((item) => ({ date: item.due, title: `CxC abierta ${item.id}`, text: item.customer, module: "CxC" }));
    const inventoryEvents = inventoryMovements.slice(-4).map((movement) => ({
      date: movement.date,
      title: `${movement.type} ${movement.sku}`,
      text: `${Math.abs(movement.qty)} · ${movement.ref}`,
      module: "Inventario"
    }));
    const bankEvents = bankMovements.slice(-3).map((movement) => ({
      date: movement.date,
      title: `${movement.type} banco`,
      text: `${movement.concept}`,
      module: "Bancos"
    }));
    const shipmentEvents = shipments
      .filter((shipment) => shipment.shipped)
      .map((shipment) => ({
        date: TODAY,
        title: `Embarque liberado ${shipment.id}`,
        text: shipment.customer,
        module: "Embarques"
      }));
    return [...decisionEvents, ...payableEvents, ...cxcEvents, ...inventoryEvents, ...bankEvents, ...shipmentEvents]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 12);
  }

  function validateSimulation(simulation) {
    const errors = [];
    simulation.inventory.forEach((item) => {
      if (item.available < 0) errors.push(`${item.sku} queda con disponible negativo (${item.available}).`);
      if (item.physicalOnHand < 0) errors.push(`${item.sku} queda con fisico negativo (${item.physicalOnHand}).`);
    });
    simulation.payables.forEach((item) => {
      if (item.balance < 0) errors.push(`${item.id} tiene saldo negativo.`);
    });
    simulation.receivables.forEach((item) => {
      if (item.balance < 0) errors.push(`${item.id} tiene saldo negativo.`);
    });
    simulation.banks.forEach((bank) => {
      const movementTotal = simulation.bankMovements
        .filter((movement) => movement.accountId === bank.id)
        .reduce((total, movement) => total + movement.amount, 0);
      const expected = bank.opening + movementTotal;
      if (Math.abs(expected - bank.balance) > 1) errors.push(`${bank.name} no cuadra con movimientos.`);
    });
    simulation.invoices.forEach((invoice) => {
      if (!invoice.cfdiStatus || !invoice.uuid) errors.push(`${invoice.id} no tiene estado CFDI completo.`);
    });
    return { ok: errors.length === 0, errors };
  }

  function sum(rows, key) {
    return rows.reduce((total, row) => total + (row[key] || 0), 0);
  }

  function compactMoney(value) {
    const amount = Math.abs(value);
    if (amount >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${Math.round(value / 1000)}K`;
    return `$${value}`;
  }

  function sortDateDesc(a, b) {
    return b.date.localeCompare(a.date);
  }

  return {
    createSimulation,
    validateSimulation,
    seed: {
      products,
      salesOrders,
      salesQuotes,
      invoices,
      receivables,
      basePayables,
      bankAccounts
    }
  };
});
