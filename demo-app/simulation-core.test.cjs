const assert = require("node:assert/strict");
const { createSimulation } = require("./simulation-core.js");

const purchase = {
  id: "OC-260517-084",
  supplier: "Quimicos del Norte",
  amount: 684250,
  paymentTerm: "30 dias",
  items: [
    { sku: "Q-CCA-1200", name: "Solucion preservante CCA", qty: 12, unit: "Tambor", price: 42100 },
    { sku: "Q-FIX-045", name: "Fijador industrial", qty: 18, unit: "Cubeta", price: 9910 }
  ]
};

const base = createSimulation({ purchases: [purchase] });
assert.equal(base.validation.ok, true, base.validation.errors.join("\n"));
assert.equal(base.payables.some((item) => item.origin === purchase.id), false);

const approved = createSimulation({
  purchases: [purchase],
  decisions: { [purchase.id]: "Aprobada" }
});
assert.equal(approved.validation.ok, true, approved.validation.errors.join("\n"));
assert.equal(approved.payables.some((item) => item.origin === purchase.id), true);
assert.equal(approved.inventory.some((item) => item.sku === "Q-CCA-1200" && item.projectedInbound >= 12), true);

const collected = createSimulation({
  purchases: [purchase],
  decisions: { [purchase.id]: "Aprobada" },
  settlements: {
    receivables: { "CXC-2603-041": true },
    payables: { "CXP-260517-084": true }
  }
});
assert.equal(collected.validation.ok, true, collected.validation.errors.join("\n"));
assert.equal(collected.receivables.find((item) => item.id === "CXC-2603-041").balance, 0);
assert.equal(collected.payables.find((item) => item.id === "CXP-260517-084").balance, 0);
assert.equal(collected.bankMovements.some((item) => item.origin === "CXC-2603-041" && item.amount > 0), true);
assert.equal(collected.bankMovements.some((item) => item.origin === "CXP-260517-084" && item.amount < 0), true);

const quoteWon = createSimulation({
  purchases: [purchase],
  salesActions: {
    wonQuotes: { "COT-260517-410": true },
    stampedInvoices: {}
  }
});
assert.equal(quoteWon.validation.ok, true, quoteWon.validation.errors.join("\n"));
assert.equal(quoteWon.sales.orders.some((item) => item.id === "PV-260517-410"), true);
assert.equal(quoteWon.invoices.find((item) => item.id === "FAC-260517-410").cfdiStatus, "Pendiente de timbrado");
assert.equal(quoteWon.receivables.find((item) => item.id === "CXC-260517-410").canCollect, false);
assert.equal(quoteWon.shipments.find((item) => item.orderId === "PV-260517-410").status, "Pendiente");
assert.equal(quoteWon.inventory.some((item) => item.sku === "POST-TEL-12" && item.reserved >= 48), true);

const quoteStampedAndCollected = createSimulation({
  purchases: [purchase],
  salesActions: {
    wonQuotes: { "COT-260517-410": true },
    stampedInvoices: { "FAC-260517-410": true }
  },
  settlements: {
    receivables: { "CXC-260517-410": true },
    payables: {}
  }
});
assert.equal(quoteStampedAndCollected.validation.ok, true, quoteStampedAndCollected.validation.errors.join("\n"));
assert.equal(quoteStampedAndCollected.invoices.find((item) => item.id === "FAC-260517-410").cfdiStatus, "Timbrada");
assert.equal(quoteStampedAndCollected.receivables.find((item) => item.id === "CXC-260517-410").balance, 0);
assert.equal(quoteStampedAndCollected.bankMovements.some((item) => item.origin === "CXC-260517-410" && item.amount > 0), true);

const shipped = createSimulation({
  purchases: [purchase],
  salesActions: {
    wonQuotes: { "COT-260517-410": true },
    stampedInvoices: { "FAC-260517-410": true },
    preparedShipments: { "PV-260517-410": true },
    shippedOrders: { "PV-260517-410": true }
  }
});
assert.equal(shipped.validation.ok, true, shipped.validation.errors.join("\n"));
assert.equal(shipped.shipments.find((item) => item.orderId === "PV-260517-410").status, "Embarcado");
assert.equal(shipped.inventoryMovements.some((item) => item.ref === "PV-260517-410" && item.type === "Salida embarque"), true);
assert.equal(shipped.inventory.find((item) => item.sku === "POST-TEL-12").reserved < quoteWon.inventory.find((item) => item.sku === "POST-TEL-12").reserved, true);

console.log("simulation-core: ok");
