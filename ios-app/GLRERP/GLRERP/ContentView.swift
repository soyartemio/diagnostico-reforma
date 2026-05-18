import SwiftUI

enum TabItem: String, CaseIterable {
    case dashboard = "Dashboard"
    case ventas = "Ventas"
    case compras = "Compras"
    case inventario = "Inventario"
    case cxp = "CxP"

    var icon: String {
        switch self {
        case .dashboard: return "chart.bar.xaxis"
        case .ventas: return "cart"
        case .compras: return "checklist"
        case .inventario: return "shippingbox"
        case .cxp: return "creditcard"
        }
    }
}

let comingModules = ["Manufactura", "Facturacion", "CxC", "Bancos"]

struct Purchase: Identifiable {
    let id: String
    let supplier: String
    let category: String
    let amount: Int
    let variation: Double
    let risk: String
    let summary: String
    let docs: [String]
}

struct Anomaly: Identifiable {
    let id: String
    let title: String
    let detail: String
    let purchaseId: String
}

struct Payable: Identifiable {
    let id: String
    let supplier: String
    let origin: String
    let amount: Int
    let due: String
    let status: String
}

final class DemoStore: ObservableObject {
    @Published var tab: TabItem = .dashboard
    @Published var selectedPurchaseId: String? = nil
    @Published var decisions: [String: String] = [:]
    @Published var resolved: Set<String> = []
    @Published var activity: [String] = []
    @Published var lastCompletion: String?

    let purchases: [Purchase] = [
        .init(id: "OC-260517-084", supplier: "Quimicos del Norte", category: "Tratamiento", amount: 684250, variation: 14.8, risk: "Alto", summary: "Compra supera historico reciente. Conviene pedir soporte de precio antes de aprobar.", docs: ["Cotizacion QN-4481", "Comparativo historico", "Ficha tecnica CCA"]),
        .init(id: "OC-260517-091", supplier: "Maderas Selectas del Pacifico", category: "Materia prima", amount: 1248000, variation: 4.2, risk: "Medio", summary: "Ligada a pedidos con inventario comprometido. Aprobar libera abastecimiento.", docs: ["Cotizacion MSP-2207", "Programa de entrega", "Inventario comprometido"]),
        .init(id: "OC-260517-102", supplier: "Herrajes Industriales del Bajio", category: "Embarques", amount: 356800, variation: 11.4, risk: "Alto", summary: "Necesaria para expediente ferroviario, pero requiere comparativo.", docs: ["Cotizacion HIB-771", "Ficha herraje ferroviario"]),
        .init(id: "OC-260517-108", supplier: "Transportes Sierra Madre", category: "Logistica", amount: 92500, variation: 2.1, risk: "Medio", summary: "Costo dentro de rango; prioridad por fecha de entrega.", docs: ["Flete TSM-184"]),
        .init(id: "OC-260517-113", supplier: "Papeleria Corporativa Norte", category: "Administracion", amount: 28400, variation: -3.2, risk: "Bajo", summary: "Compra menor por debajo del historico.", docs: ["Cotizacion PCN-55"]),
        .init(id: "OC-260517-119", supplier: "Energia y Calderas del Norte", category: "Servicios", amount: 512600, variation: 8.6, risk: "Alto", summary: "Servicio critico. Aprobar solo con alcance firmado.", docs: ["Alcance tecnico", "Historico de servicios"])
    ]

    let anomalies: [Anomaly] = [
        .init(id: "precio", title: "Variacion de precio", detail: "3 OC arriba de historico requieren explicacion.", purchaseId: "OC-260517-084"),
        .init(id: "inventario", title: "Inventario sensible", detail: "4 SKU con cobertura menor a una semana.", purchaseId: "OC-260517-091"),
        .init(id: "docs", title: "Evidencia faltante", detail: "5 expedientes requieren ficha tecnica o certificado.", purchaseId: "OC-260517-102")
    ]

    let basePayables: [Payable] = [
        .init(id: "CXP-260517-301", supplier: "Maderas Selectas del Pacifico", origin: "ERP-PO-91790", amount: 612000, due: "22 mayo", status: "Programada"),
        .init(id: "CXP-260517-302", supplier: "Servicios Industriales Laguna", origin: "ERP-PO-91801", amount: 187900, due: "19 mayo", status: "Por validar"),
        .init(id: "CXP-260517-303", supplier: "Transportes Sierra Madre", origin: "ERP-PO-91816", amount: 92500, due: "21 mayo", status: "Programada")
    ]

    var selectedPurchase: Purchase {
        purchases.first { $0.id == selectedPurchaseId } ?? purchases[0]
    }

    var payables: [Payable] {
        let generated = purchases
            .filter { decisions[$0.id] == "Aprobada" }
            .map { purchase in
                Payable(
                    id: "CXP-\(purchase.id.replacingOccurrences(of: "OC-", with: ""))",
                    supplier: purchase.supplier,
                    origin: purchase.id,
                    amount: purchase.amount,
                    due: "16 junio",
                    status: "Generada por aprobacion"
                )
            }
        return generated + basePayables
    }

    func decide(_ decision: String) {
        guard let selectedPurchaseId else { return }
        decisions[selectedPurchaseId] = decision
        activity.insert("\(decision): \(selectedPurchaseId)", at: 0)
        lastCompletion = decision == "Aprobada" ? "\(selectedPurchaseId) genero CxP." : "\(selectedPurchaseId) se movio a Resuelto hoy."
        self.selectedPurchaseId = nil
    }

    func reopen() {
        guard let selectedPurchaseId else { return }
        decisions.removeValue(forKey: selectedPurchaseId)
        activity.insert("Reabierta decision: \(selectedPurchaseId)", at: 0)
        lastCompletion = "\(selectedPurchaseId) regreso a Pendientes."
    }
}

struct ContentView: View {
    @StateObject private var store = DemoStore()

    var body: some View {
        ZStack {
            GLRColor.background.ignoresSafeArea()
            VStack(spacing: 0) {
                HeaderView(store: store)
                ScrollView {
                    VStack(spacing: 16) {
                        switch store.tab {
                        case .dashboard: DashboardView(store: store)
                        case .ventas: SalesView(store: store)
                        case .compras: PurchasesView(store: store)
                        case .inventario: InventoryView(store: store)
                        case .cxp: PayablesView(store: store)
                        }
                    }
                    .padding(18)
                    .padding(.bottom, 86)
                }
                BottomTabBar(store: store)
            }
        }
        .preferredColorScheme(.light)
    }
}

struct HeaderView: View {
    @ObservedObject var store: DemoStore

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Arbor")
                    .font(.system(size: 13, weight: .black))
                    .foregroundStyle(GLRColor.gold)
                Text(store.tab.rawValue)
                    .font(.system(size: 30, weight: .heavy))
                    .foregroundStyle(GLRColor.ink)
            }
            Spacer()
            Menu {
                Section("Modulos activos") {
                    ForEach(TabItem.allCases, id: \.self) { tab in
                        Button {
                            withAnimation(.spring(response: 0.26, dampingFraction: 0.86)) { store.tab = tab }
                        } label: {
                            Label(tab.rawValue, systemImage: tab.icon)
                        }
                    }
                }
                Section("Siguientes etapas") {
                    ForEach(comingModules, id: \.self) { module in
                        Label(module, systemImage: "lock")
                    }
                }
            } label: {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 18, weight: .black))
                    .foregroundStyle(GLRColor.forest)
                    .frame(width: 44, height: 44)
                    .background(.white)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(GLRColor.line))
            }
            .accessibilityLabel("Menu")
        }
        .padding(.horizontal, 18)
        .padding(.top, 14)
        .padding(.bottom, 10)
        .background(.ultraThinMaterial)
    }
}

struct BottomTabBar: View {
    @ObservedObject var store: DemoStore

    var body: some View {
        HStack(spacing: 0) {
            ForEach(TabItem.allCases, id: \.self) { tab in
                Button {
                    withAnimation(.spring(response: 0.26, dampingFraction: 0.86)) { store.tab = tab }
                } label: {
                    VStack(spacing: 5) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 17, weight: .bold))
                        Text(tab.rawValue)
                            .font(.system(size: 10, weight: .black))
                    }
                    .foregroundStyle(store.tab == tab ? GLRColor.forest : GLRColor.muted)
                    .frame(height: 54)
                        .frame(maxWidth: .infinity)
                    .background(store.tab == tab ? GLRColor.selected : Color.clear)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .accessibilityLabel(tab.rawValue)
            }
        }
        .padding(8)
        .background(.ultraThinMaterial)
        .overlay(Rectangle().fill(GLRColor.line).frame(height: 1), alignment: .top)
    }
}

struct DashboardView: View {
    @ObservedObject var store: DemoStore
    private var openAnomalies: [Anomaly] { store.anomalies.filter { !store.resolved.contains($0.id) } }
    private var resolvedAnomalies: [Anomaly] { store.anomalies.filter { store.resolved.contains($0.id) } }

    var body: some View {
        VStack(spacing: 16) {
            IntelligenceCard(title: "Brief operativo", lines: [
                "\(store.purchases.filter { store.decisions[$0.id] == nil }.count) compras por decidir.",
                "Mayor riesgo: OC-260517-084 por variacion de precio.",
                "Inventario CCA con cobertura de 3 dias."
            ])

            TodayFocusPanel(store: store)

            LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 12) {
                MetricCard(title: "Ventas", value: "$18.4M", tone: .green)
                MetricCard(title: "Compras", value: "$4.7M", tone: GLRColor.gold)
                MetricCard(title: "CxC vencida", value: "$2.1M", tone: .red)
                MetricCard(title: "Inventario critico", value: "7 SKU", tone: .red)
            }

            Panel(title: "Radar de anomalias") {
                VStack(spacing: 10) {
                    SectionLabel(title: "Abiertas", count: openAnomalies.count)
                    ForEach(openAnomalies) { anomaly in
                        AnomalyRow(store: store, anomaly: anomaly)
                    }
                    SectionLabel(title: "Resueltas hoy", count: resolvedAnomalies.count, resolved: true)
                    if resolvedAnomalies.isEmpty {
                        EmptyState(text: "Sin anomalias resueltas todavia.")
                    } else {
                        ForEach(resolvedAnomalies) { anomaly in
                            AnomalyRow(store: store, anomaly: anomaly)
                        }
                    }
                }
            }
        }
    }
}

struct TodayFocusPanel: View {
    @ObservedObject var store: DemoStore
    private var highRisk: Purchase? { store.purchases.first { $0.risk == "Alto" && store.decisions[$0.id] == nil } }

    var body: some View {
        Panel(title: "Hoy requiere atencion") {
            VStack(spacing: 10) {
                FocusActionRow(
                    title: "Decidir compra sensible",
                    detail: "\(highRisk?.id ?? "OC") con variacion por validar.",
                    tone: GLRColor.red
                ) {
                    store.selectedPurchaseId = highRisk?.id
                    store.tab = .compras
                }
                FocusActionRow(
                    title: "Proteger inventario critico",
                    detail: "CCA y pino industrial afectan pedidos comprometidos.",
                    tone: GLRColor.gold
                ) {
                    store.tab = .inventario
                }
                FocusActionRow(
                    title: "Cerrar decisiones del dia",
                    detail: "\(store.purchases.filter { store.decisions[$0.id] == nil }.count) compras siguen pendientes.",
                    tone: GLRColor.green
                ) {
                    store.tab = .compras
                }
            }
        }
    }
}

struct FocusActionRow: View {
    let title: String
    let detail: String
    let tone: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(tone)
                    .frame(width: 5)
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 15, weight: .black))
                        .foregroundStyle(GLRColor.forest)
                    Text(detail)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(GLRColor.muted)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .black))
                    .foregroundStyle(tone)
            }
            .padding(12)
            .background(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(GLRColor.line))
        }
        .buttonStyle(.plain)
    }
}

struct PurchasesView: View {
    @ObservedObject var store: DemoStore
    private var pending: [Purchase] { store.purchases.filter { store.decisions[$0.id] == nil } }
    private var resolved: [Purchase] { store.purchases.filter { store.decisions[$0.id] != nil } }

    var body: some View {
        VStack(spacing: 14) {
            SectionLabel(title: "Pendientes", count: pending.count)
            if pending.isEmpty {
                EmptyState(text: "Todo limpio por ahora. Las compras decididas quedaron agrupadas abajo.")
            }
            ForEach(pending) { purchase in
                Button {
                    store.selectedPurchaseId = store.selectedPurchaseId == purchase.id ? nil : purchase.id
                } label: {
                    PurchaseRow(purchase: purchase, decision: store.decisions[purchase.id], selected: store.selectedPurchaseId == purchase.id)
                }
                .buttonStyle(.plain)
                if store.selectedPurchaseId == purchase.id {
                    PurchaseDetail(store: store)
                        .transition(.opacity.combined(with: .move(edge: .top)))
                }
            }

            SectionLabel(title: "Resuelto hoy", count: resolved.count, resolved: true)
            if resolved.isEmpty {
                EmptyState(text: "Aun no hay compras resueltas. Toma una decision para verlas aqui.")
            } else {
                ForEach(resolved) { purchase in
                    Button {
                        store.selectedPurchaseId = store.selectedPurchaseId == purchase.id ? nil : purchase.id
                    } label: {
                        PurchaseRow(purchase: purchase, decision: store.decisions[purchase.id], selected: store.selectedPurchaseId == purchase.id)
                    }
                    .buttonStyle(.plain)
                    if store.selectedPurchaseId == purchase.id {
                        PurchaseDetail(store: store)
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }
                }
            }

            if let lastCompletion = store.lastCompletion, store.selectedPurchaseId == nil {
                CompletionBanner(text: lastCompletion)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }

            if store.selectedPurchaseId == nil {
                EmptyState(text: "Toca cualquier OC para abrir su expediente justo debajo de la tarjeta.")
            }
        }
        .animation(.spring(response: 0.28, dampingFraction: 0.86), value: store.selectedPurchaseId)
        .animation(.spring(response: 0.28, dampingFraction: 0.86), value: store.decisions)
    }
}

struct SalesView: View {
    @ObservedObject var store: DemoStore
    private let orders = [
        ("PV-260517-2201", "CFE Norte", 6200000, "Embarque parcial", "Requiere certificado anexo"),
        ("PV-260517-2218", "Telecom Bajio", 3100000, "Listo para surtir", "Inventario comprometido"),
        ("PV-260517-2234", "Constructoras regionales", 1900000, "Cotizacion ganada", "Depende de OC critica")
    ]
    private let quotes = [
        ("COT-260517-410", "Infraestructura Norte", 840000, "72%", "Confirmar vigencia hoy"),
        ("COT-260517-418", "Minera del Centro", 1280000, "54%", "Adjuntar ficha tecnica"),
        ("COT-260517-426", "Logistica Ferroviaria MX", 2150000, "68%", "Validar herrajes")
    ]

    var body: some View {
        VStack(spacing: 14) {
            IntelligenceCard(title: "Ventas conectadas a inventario", lines: [
                "Pedidos, cotizaciones y margen se leen junto a disponibilidad.",
                "Una venta puede llevar directo a inventario o compras pendientes."
            ])
            Panel(title: "Pedidos vivos") {
                VStack(spacing: 10) {
                    ForEach(orders, id: \.0) { order in
                        BusinessRecordCard(id: order.0, title: order.1, amount: order.2, status: order.3, note: order.4, tone: .green)
                    }
                }
            }
            Panel(title: "Cotizaciones activas") {
                VStack(spacing: 10) {
                    ForEach(quotes, id: \.0) { quote in
                        BusinessRecordCard(id: quote.0, title: quote.1, amount: quote.2, status: "Probabilidad \(quote.3)", note: quote.4, tone: .gold)
                    }
                }
            }
            Button {
                store.tab = .inventario
            } label: {
                Label("Ver inventario critico", systemImage: "shippingbox")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(SecondaryButtonStyle())
        }
    }
}

struct PurchaseDetail: View {
    @ObservedObject var store: DemoStore
    @State private var showingDocs = false
    private var purchase: Purchase { store.selectedPurchase }
    private var decision: String { store.decisions[purchase.id] ?? "Pendiente" }
    private var decided: Bool { decision != "Pendiente" }

    var body: some View {
        Panel(title: purchase.supplier) {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    Text(purchase.category).pill(.gold)
                    Spacer()
                    Text(decision).pill(decision == "Aprobada" ? .green : decision == "Rechazada" ? .red : .gold)
                }

                Text(currency(purchase.amount))
                    .font(.system(size: 34, weight: .black))
                    .foregroundStyle(GLRColor.forest)

                IntelligenceCard(title: "\(riskScore(purchase)) puntos de riesgo", lines: [
                    purchase.summary,
                    "Variacion: \(purchase.variation > 0 ? "+" : "")\(String(format: "%.1f", purchase.variation))% contra historico.",
                    "Siguiente accion sugerida: \(purchase.risk == "Alto" ? "pedir aclaracion" : "validar documentos")"
                ])

                HStack(spacing: 10) {
                    DecisionButton("Aprobar", color: GLRColor.green, disabled: decided) { store.decide("Aprobada") }
                    DecisionButton("Aclarar", color: GLRColor.gold, disabled: decided) { store.decide("Aclaracion") }
                    DecisionButton("Rechazar", color: GLRColor.red, disabled: decided) { store.decide("Rechazada") }
                }
                if decided {
                    Button("Reabrir decision") { store.reopen() }
                        .buttonStyle(SecondaryButtonStyle())
                }

                DecisionChecklistView(purchase: purchase)
                SupplierScoreView(purchase: purchase)
                QuoteCompareView(purchase: purchase)

                Button {
                    showingDocs = true
                } label: {
                    Label("Ver cotizacion y ficha tecnica", systemImage: "doc.text.magnifyingglass")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(SecondaryButtonStyle())
            }
        }
        .sheet(isPresented: $showingDocs) {
            DocumentsSheet(purchase: purchase)
        }
    }
}

struct DecisionChecklistView: View {
    let purchase: Purchase
    private var hasSupport: Bool {
        purchase.docs.contains {
            $0.localizedCaseInsensitiveContains("Ficha") ||
            $0.localizedCaseInsensitiveContains("Inventario") ||
            $0.localizedCaseInsensitiveContains("Alcance") ||
            $0.localizedCaseInsensitiveContains("Programa")
        }
    }
    private var rows: [(String, String, Bool)] {
        [
            ("Cotizacion adjunta", purchase.docs.isEmpty ? "Falta evidencia." : "Evidencia disponible.", !purchase.docs.isEmpty),
            ("Precio contra historico", purchase.variation <= 5 ? "Variacion dentro de rango." : "\(String(format: "%.1f", purchase.variation))% requiere explicacion.", purchase.variation <= 5),
            ("Soporte tecnico", hasSupport ? "Documento operativo ligado." : "Conviene pedir ficha o alcance.", hasSupport),
            ("Impacto financiero", purchase.amount < 450000 ? "Puede entrar a flujo normal." : "Revisar caja antes de liberar.", purchase.amount < 450000)
        ]
    }

    var body: some View {
        Panel(title: "Checklist inteligente") {
            VStack(spacing: 9) {
                ForEach(rows.indices, id: \.self) { index in
                    let row = rows[index]
                    HStack(alignment: .top, spacing: 10) {
                        Text(row.2 ? "OK" : "!")
                            .font(.system(size: 11, weight: .black))
                            .foregroundStyle(row.2 ? GLRColor.green : GLRColor.gold)
                            .frame(width: 30, height: 30)
                            .background((row.2 ? GLRColor.green : GLRColor.gold).opacity(0.14))
                            .clipShape(Circle())
                        VStack(alignment: .leading, spacing: 3) {
                            Text(row.0)
                                .font(.system(size: 14, weight: .black))
                                .foregroundStyle(GLRColor.forest)
                            Text(row.1)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundStyle(GLRColor.muted)
                        }
                        Spacer()
                    }
                    .padding(10)
                    .background(GLRColor.background.opacity(0.55))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
    }
}

struct SupplierScoreView: View {
    let purchase: Purchase
    private var score: Int { supplierScore(purchase) }

    var body: some View {
        Panel(title: "Score de proveedor") {
            HStack(spacing: 16) {
                ZStack {
                    Circle().stroke(GLRColor.line, lineWidth: 10)
                    Circle()
                        .trim(from: 0, to: CGFloat(score) / 100)
                        .stroke(GLRColor.green, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    VStack(spacing: 0) {
                        Text("\(score)")
                            .font(.system(size: 30, weight: .black))
                            .foregroundStyle(GLRColor.forest)
                        Text("score")
                            .font(.system(size: 10, weight: .black))
                            .foregroundStyle(GLRColor.muted)
                    }
                }
                .frame(width: 104, height: 104)
                VStack(alignment: .leading, spacing: 7) {
                    Text(score >= 82 ? "Proveedor confiable" : score >= 70 ? "Con vigilancia" : "Revisar antes de aprobar")
                        .font(.system(size: 18, weight: .black))
                        .foregroundStyle(GLRColor.forest)
                    Text("\(purchase.docs.count) documentos · riesgo \(purchase.risk) · variacion \(String(format: "%.1f", purchase.variation))%")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(GLRColor.muted)
                }
                Spacer()
            }
        }
    }
}

struct QuoteCompareView: View {
    let purchase: Purchase
    private var historic: Int {
        let denominator = 1 + (purchase.variation / 100)
        return denominator == 0 ? purchase.amount : Int(Double(purchase.amount) / denominator)
    }
    private var target: Int { Int(Double(purchase.amount) * (purchase.risk == "Alto" ? 0.94 : 0.98)) }

    var body: some View {
        Panel(title: "Comparativo de cotizaciones") {
            VStack(spacing: 10) {
                QuoteRow(label: "Proveedor actual", amount: purchase.amount, note: "\(String(format: "%.1f", purchase.variation))% vs historico", tone: purchase.variation > 8 ? GLRColor.red : GLRColor.gold)
                QuoteRow(label: "Ultima compra", amount: historic, note: "Referencia historica", tone: GLRColor.muted)
                QuoteRow(label: "Meta negociada", amount: target, note: "Recomendado", tone: GLRColor.green)
            }
        }
    }
}

struct QuoteRow: View {
    let label: String
    let amount: Int
    let note: String
    let tone: Color

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(label)
                    .font(.system(size: 14, weight: .black))
                    .foregroundStyle(GLRColor.forest)
                Text(note)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(tone)
            }
            Spacer()
            Text(currency(amount))
                .font(.system(size: 17, weight: .black))
                .foregroundStyle(GLRColor.forest)
        }
        .padding(12)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(tone.opacity(0.35)))
    }
}

struct InventoryView: View {
    @ObservedObject var store: DemoStore

    var body: some View {
        VStack(spacing: 14) {
            IntelligenceCard(title: "Inventario que explica el por que", lines: [
                "No solo muestra faltantes: conecta cobertura, pedidos afectados y compra sugerida.",
                "CCA y pino industrial son los puntos criticos de hoy."
            ])
            ForEach(["Solucion preservante CCA: cobertura 3 dias", "Pino dimensionado: cobertura 4 dias", "Herrajes ferroviarios: entrega parcial"], id: \.self) { item in
                Panel(title: item) {
                    Text("Impacto: puede retrasar pedidos industriales. Accion: revisar compra ligada y evidencia.")
                        .foregroundStyle(GLRColor.muted)
                }
            }
            Panel(title: "Compras ligadas") {
                VStack(spacing: 10) {
                    ForEach(store.purchases.filter { ["OC-260517-084", "OC-260517-091", "OC-260517-102"].contains($0.id) }) { purchase in
                        Button {
                            store.selectedPurchaseId = purchase.id
                            store.tab = .compras
                        } label: {
                            BusinessRecordCard(id: purchase.id, title: purchase.supplier, amount: purchase.amount, status: store.decisions[purchase.id] ?? "Pendiente", note: purchase.category, tone: .gold)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }
}

struct PayablesView: View {
    @ObservedObject var store: DemoStore
    private var total: Int { store.payables.reduce(0) { $0 + $1.amount } }

    var body: some View {
        VStack(spacing: 14) {
            IntelligenceCard(title: "CxP nace desde la decision", lines: [
                "Cuando una OC se aprueba, aparece aqui como compromiso financiero.",
                "\(store.payables.count) registros visibles por \(currency(total))."
            ])
            Panel(title: "CxP por programar") {
                VStack(spacing: 10) {
                    ForEach(store.payables) { payable in
                        PayableRow(payable: payable)
                    }
                }
            }
            Panel(title: "Flujo 7 dias") {
                VStack(spacing: 10) {
                    CashBucket(label: "Hoy", amount: store.payables.filter { $0.due.contains("19") }.reduce(0) { $0 + $1.amount }, total: total)
                    CashBucket(label: "Esta semana", amount: store.payables.filter { !$0.status.contains("Generada") }.reduce(0) { $0 + $1.amount }, total: total)
                    CashBucket(label: "Generado hoy", amount: store.payables.filter { $0.status.contains("Generada") }.reduce(0) { $0 + $1.amount }, total: total)
                }
            }
        }
    }
}

struct BusinessRecordCard: View {
    let id: String
    let title: String
    let amount: Int
    let status: String
    let note: String
    let tone: PillTone

    var body: some View {
        VStack(alignment: .leading, spacing: 9) {
            HStack {
                Text(id)
                    .font(.system(size: 12, weight: .black))
                    .foregroundStyle(GLRColor.gold)
                Spacer()
                Text(status).pill(tone)
            }
            Text(title)
                .font(.system(size: 18, weight: .black))
                .foregroundStyle(GLRColor.forest)
            HStack {
                Text(currency(amount))
                    .font(.system(size: 20, weight: .black))
                    .foregroundStyle(GLRColor.forest)
                Spacer()
            }
            Text(note)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(GLRColor.muted)
        }
        .padding(14)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(GLRColor.line))
    }
}

struct PayableRow: View {
    let payable: Payable

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(payable.id)
                    .font(.system(size: 12, weight: .black))
                    .foregroundStyle(GLRColor.gold)
                Spacer()
                Text(payable.status.contains("Generada") ? "Nueva" : payable.status)
                    .pill(payable.status.contains("Generada") ? .green : .gold)
            }
            Text(payable.supplier)
                .font(.system(size: 17, weight: .black))
                .foregroundStyle(GLRColor.forest)
            HStack {
                Text(currency(payable.amount))
                    .font(.system(size: 20, weight: .black))
                    .foregroundStyle(GLRColor.forest)
                Spacer()
                Text(payable.due)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(GLRColor.muted)
            }
            Text(payable.origin)
                .font(.system(size: 12, weight: .black))
                .foregroundStyle(GLRColor.green)
        }
        .padding(14)
        .background(payable.status.contains("Generada") ? GLRColor.selected : .white)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(payable.status.contains("Generada") ? GLRColor.green.opacity(0.35) : GLRColor.line))
    }
}

struct CashBucket: View {
    let label: String
    let amount: Int
    let total: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.system(size: 12, weight: .black))
                .foregroundStyle(GLRColor.muted)
            Text(currency(amount))
                .font(.system(size: 22, weight: .black))
                .foregroundStyle(GLRColor.forest)
            GeometryReader { proxy in
                RoundedRectangle(cornerRadius: 999)
                    .fill(GLRColor.line)
                    .overlay(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 999)
                            .fill(GLRColor.green)
                            .frame(width: max(8, proxy.size.width * CGFloat(amount) / CGFloat(max(total, 1))))
                    }
            }
            .frame(height: 8)
        }
        .padding(14)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(GLRColor.line))
    }
}

struct PurchaseRow: View {
    let purchase: Purchase
    let decision: String?
    let selected: Bool

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 6) {
                Text(purchase.id).font(.system(size: 13, weight: .black)).foregroundStyle(GLRColor.gold)
                Text(purchase.supplier).font(.system(size: 17, weight: .heavy)).foregroundStyle(GLRColor.ink)
                Text("\(purchase.risk) riesgo · \(currency(purchase.amount))").font(.system(size: 13, weight: .medium)).foregroundStyle(GLRColor.muted)
            }
            Spacer()
            Text(decision ?? "Pendiente").pill(decision == "Aprobada" ? .green : decision == "Rechazada" ? .red : .gold)
        }
        .padding(16)
        .background(selected ? GLRColor.selected : .white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(selected ? GLRColor.green : GLRColor.line))
    }
}

struct SectionLabel: View {
    let title: String
    let count: Int
    var resolved = false

    var body: some View {
        HStack {
            Text(title.uppercased())
                .font(.system(size: 12, weight: .black))
                .foregroundStyle(resolved ? GLRColor.green : GLRColor.forest)
            Spacer()
            Text("\(count)")
                .font(.system(size: 12, weight: .black))
                .foregroundStyle(.white)
                .frame(minWidth: 28, minHeight: 24)
                .background(resolved ? GLRColor.green : GLRColor.forest)
                .clipShape(Capsule())
        }
        .padding(.top, 6)
    }
}

struct EmptyState: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.system(size: 14, weight: .medium))
            .foregroundStyle(GLRColor.muted)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .background(.white.opacity(0.55))
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(GLRColor.line, style: StrokeStyle(lineWidth: 1, dash: [5, 4])))
    }
}

struct CompletionBanner: View {
    let text: String

    var body: some View {
        HStack(spacing: 10) {
            Text("Listo")
                .font(.system(size: 12, weight: .black))
                .foregroundStyle(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(GLRColor.green)
                .clipShape(Capsule())
            Text(text)
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(GLRColor.forest)
            Spacer()
        }
        .padding(14)
        .background(LinearGradient(colors: [Color(red: 236/255, green: 253/255, blue: 243/255), .white], startPoint: .topLeading, endPoint: .bottomTrailing))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(GLRColor.green.opacity(0.35)))
    }
}

struct AnomalyRow: View {
    @ObservedObject var store: DemoStore
    let anomaly: Anomaly

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(store.resolved.contains(anomaly.id) ? "Resuelta" : anomaly.title).pill(store.resolved.contains(anomaly.id) ? .green : .gold)
                Spacer()
            }
            Text(anomaly.detail).font(.system(size: 15, weight: .semibold)).foregroundStyle(GLRColor.ink)
            HStack {
                Button("Ver OC") {
                    store.selectedPurchaseId = anomaly.purchaseId
                    store.tab = .compras
                }
                .buttonStyle(SecondaryButtonStyle())
                Button(store.resolved.contains(anomaly.id) ? "Reabrir" : "Resolver") {
                    if store.resolved.contains(anomaly.id) { store.resolved.remove(anomaly.id) } else { store.resolved.insert(anomaly.id) }
                }
                .buttonStyle(PrimaryButtonStyle())
            }
        }
        .padding(14)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(GLRColor.line))
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let tone: Color
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title).font(.system(size: 12, weight: .black)).foregroundStyle(GLRColor.muted)
            Text(value).font(.system(size: 25, weight: .black)).foregroundStyle(GLRColor.forest)
            Circle().fill(tone).frame(width: 9, height: 9)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(GLRColor.line))
    }
}

struct IntelligenceCard: View {
    let title: String
    let lines: [String]
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Arbor Intelligence").font(.system(size: 12, weight: .black)).foregroundStyle(GLRColor.gold)
            Text(title).font(.system(size: 22, weight: .black)).foregroundStyle(.white)
            ForEach(lines, id: \.self) { line in
                Text(line).font(.system(size: 14, weight: .medium)).foregroundStyle(GLRColor.mint)
            }
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(LinearGradient(colors: [GLRColor.forest, GLRColor.forest2], startPoint: .topLeading, endPoint: .bottomTrailing))
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }
}

struct Panel<Content: View>: View {
    let title: String
    @ViewBuilder var content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(title).font(.system(size: 21, weight: .black)).foregroundStyle(GLRColor.ink)
            content
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .shadow(color: .black.opacity(0.06), radius: 16, y: 8)
    }
}

struct DocumentsSheet: View {
    let purchase: Purchase
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    IntelligenceCard(title: "Expediente documental", lines: [
                        "Cotizacion, ficha tecnica y evidencia viven ligados a la OC.",
                        "El sistema muestra como evitar correos perdidos antes de autorizar."
                    ])
                ForEach(purchase.docs, id: \.self) { doc in
                        DocumentPreviewCard(title: doc, purchase: purchase)
                    }
                }
                .padding(18)
            }
            .navigationTitle("Documentos")
        }
    }
}

struct DocumentPreviewCard: View {
    let title: String
    let purchase: Purchase

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("PDF").pill(.gold)
                Spacer()
                Text(purchase.id)
                    .font(.system(size: 12, weight: .black))
                    .foregroundStyle(GLRColor.muted)
            }
            Text(title)
                .font(.system(size: 19, weight: .black))
                .foregroundStyle(GLRColor.forest)
            Text("Documento ligado al expediente. Incluye vigencia, subtotal, IVA, condiciones y evidencia tecnica.")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(GLRColor.muted)
            HStack {
                Text("Validado").pill(.green)
                Text("Vista previa").pill(.gold)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(alignment: .leading) {
            Rectangle()
                .fill(GLRColor.gold)
                .frame(width: 5)
        }
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(GLRColor.line))
    }
}

struct DecisionButton: View {
    let title: String
    let color: Color
    let disabled: Bool
    let action: () -> Void
    init(_ title: String, color: Color, disabled: Bool, action: @escaping () -> Void) {
        self.title = title; self.color = color; self.disabled = disabled; self.action = action
    }
    var body: some View {
        Button(action: action) {
            Text(title).font(.system(size: 13, weight: .black)).frame(maxWidth: .infinity).padding(.vertical, 14)
        }
        .background(color.opacity(disabled ? 0.28 : 1))
        .foregroundStyle(.white)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .disabled(disabled)
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 13, weight: .bold))
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(GLRColor.green.opacity(configuration.isPressed ? 0.82 : 1))
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 13, weight: .bold))
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(configuration.isPressed ? GLRColor.selected : .white)
            .foregroundStyle(GLRColor.forest)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(GLRColor.line))
    }
}

enum PillTone { case green, gold, red }

extension Text {
    func pill(_ tone: PillTone) -> some View {
        let color: Color = tone == .green ? GLRColor.green : tone == .red ? GLRColor.red : GLRColor.gold
        return self
            .font(.system(size: 11, weight: .black))
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(color.opacity(0.14))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }
}

enum GLRColor {
    static let forest = Color(red: 16/255, green: 47/255, blue: 36/255)
    static let forest2 = Color(red: 24/255, green: 70/255, blue: 50/255)
    static let green = Color(red: 36/255, green: 112/255, blue: 71/255)
    static let gold = Color(red: 185/255, green: 138/255, blue: 70/255)
    static let red = Color(red: 168/255, green: 33/255, blue: 24/255)
    static let ink = Color(red: 32/255, green: 38/255, blue: 34/255)
    static let muted = Color(red: 101/255, green: 115/255, blue: 107/255)
    static let mint = Color(red: 223/255, green: 236/255, blue: 227/255)
    static let line = Color(red: 227/255, green: 221/255, blue: 208/255)
    static let background = Color(red: 247/255, green: 243/255, blue: 234/255)
    static let selected = Color(red: 240/255, green: 248/255, blue: 242/255)
}

func currency(_ value: Int) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.currencyCode = "MXN"
    formatter.maximumFractionDigits = 0
    return formatter.string(from: NSNumber(value: value)) ?? "$\(value)"
}

func riskScore(_ purchase: Purchase) -> Int {
    let base = purchase.risk == "Alto" ? 78 : purchase.risk == "Medio" ? 52 : 24
    return min(96, Int(Double(base) + max(0, purchase.variation) * 1.2))
}

func supplierScore(_ purchase: Purchase) -> Int {
    let riskPenalty = purchase.risk == "Alto" ? 14 : purchase.risk == "Medio" ? 7 : 0
    let variationPenalty = max(0, purchase.variation) * 0.8
    let documentBonus = min(6, purchase.docs.count * 2)
    return max(58, min(96, Int(88 - Double(riskPenalty) - variationPenalty + Double(documentBonus))))
}
