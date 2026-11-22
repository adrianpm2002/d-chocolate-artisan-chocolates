import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, ChartNoAxesCombined, ChevronLeft, ChevronRight, Download, Package, ShoppingBag, TriangleAlert, Wallet, Boxes, LayoutDashboard } from "lucide-react";
import { BrandLogo } from "@/components/catalog/BrandLogo";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/pricing";
import { DEMO_INVENTORY, DEMO_SALES, DEMO_TODAY, dashboardData, movePeriod, replenishment, type SalesView } from "@/lib/sales-dashboard";
import { cn } from "@/lib/utils";

const SalesChart = lazy(() => import("@/components/admin/SalesChart").then((module) => ({ default: module.SalesChart })));
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Dashboard de ventas | Administración D'ChocolAte" },
    { name: "description", content: "Panel de ventas diarias, semanales y mensuales, productos más vendidos y alertas de reposición de D'ChocolAte." },
    { property: "og:title", content: "Dashboard de ventas | D'ChocolAte" },
    { property: "og:description", content: "Resumen de ventas y reposición de productos e insumos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex, nofollow" },
  ] }), component: AdminDashboard,
});

const views: { id: SalesView; label: string }[] = [{ id: "diaria", label: "Diarias" }, { id: "semanal", label: "Semanales" }, { id: "mensual", label: "Mensuales" }];
const dateLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function AdminDashboard() {
  const [view, setView] = useState<SalesView>("diaria");
  const [end, setEnd] = useState(DEMO_TODAY);
  const [alertType, setAlertType] = useState<"todos" | "producto" | "insumo">("todos");
  const data = dashboardData(DEMO_SALES, view, end);
  const alerts = replenishment(DEMO_INVENTORY);
  const visibleAlerts = alerts.filter((a) => alertType === "todos" || a.type === alertType);
  const rangeLabel = `${dateLabel(data.range.start)} — ${dateLabel(data.range.end)}`;
  const exportSales = () => {
    const rows = ["Fecha;Ventas CUP;Número de ventas", ...data.points.map((p) => `${p.date};${p.revenue.toFixed(2)};${p.orders}`)];
    const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `ventas-${view}-${end}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="flex border-b border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex w-full items-center justify-between gap-4 px-5 py-5 lg:block">
          <BrandLogo /><p className="hidden mt-3 text-xs font-bold uppercase text-muted-foreground lg:block">Administración</p>
          <Button asChild variant="ghost" size="icon" className="lg:hidden"><Link to="/" aria-label="Volver a la tienda"><ArrowLeft /></Link></Button>
        </div>
        <nav aria-label="Administración" className="hidden p-3 lg:block">
          <Button asChild variant="secondary" className="h-11 w-full justify-start font-bold"><Link to="/admin"><LayoutDashboard /> Dashboard de ventas</Link></Button>
        </nav>
        <div className="mt-auto hidden border-t border-border p-4 lg:block"><Button asChild variant="ghost" className="w-full justify-start"><Link to="/"><ArrowLeft /> Volver a la tienda</Link></Button></div>
      </aside>
      <main className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-8">
          <p className="text-sm font-bold text-muted-foreground">Administración <span className="mx-2 text-border">/</span> <span className="text-foreground">Ventas</span></p>
          <span className="rounded-md border border-rosa bg-blush px-2.5 py-1 text-xs font-bold text-rosa-deep">Datos de ejemplo · sin ventas reales</span>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="font-script text-xl text-caramel">Así va tu negocio</p><h1 className="mt-1 text-3xl font-bold text-primary sm:text-4xl">Dashboard de ventas</h1></div>
            <Button variant="outline" onClick={exportSales}><Download /> Exportar ventas</Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
            <div className="flex rounded-lg border border-border bg-card p-1" role="group" aria-label="Periodo de ventas">
              {views.map((v) => <Button key={v.id} variant={view === v.id ? "brand" : "ghost"} aria-pressed={view === v.id} onClick={() => { setView(v.id); setEnd(DEMO_TODAY); }} className="px-3 sm:px-5">{v.label}</Button>)}
            </div>
            <div className="flex min-w-0 items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Periodo anterior" title="Periodo anterior" disabled={data.range.start <= "2025-11-23"} onClick={() => setEnd(movePeriod(view, end, -1))}><ChevronLeft /></Button>
              <p className="text-center text-xs font-bold text-muted-foreground sm:text-sm">{rangeLabel}</p>
              <Button variant="ghost" size="icon" aria-label="Periodo siguiente" title="Periodo siguiente" disabled={end >= DEMO_TODAY} onClick={() => setEnd(movePeriod(view, end, 1) > DEMO_TODAY ? DEMO_TODAY : movePeriod(view, end, 1))}><ChevronRight /></Button>
            </div>
          </div>
          <section aria-label="Resumen de ventas" className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: "Ventas netas", value: formatPrice(data.revenue), icon: Wallet, detail: "Importe cobrado, con descuentos" },
              { label: "Ventas realizadas", value: String(data.orders), icon: ShoppingBag, detail: "Operaciones del periodo" },
              { label: "Venta promedio", value: formatPrice(data.average), icon: ChartNoAxesCombined, detail: "Importe por operación" },
              { label: "Unidades vendidas", value: String(data.units), icon: Package, detail: "Productos y packs" },
            ].map((metric) => <article key={metric.label} className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2"><h2 className="text-xs font-bold text-muted-foreground sm:text-sm">{metric.label}</h2><metric.icon className="size-4 shrink-0 text-caramel" /></div>
              <p className="mt-4 break-words font-display text-xl font-bold text-primary sm:text-2xl" data-testid={metric.label === "Ventas netas" ? "net-sales" : undefined}>{metric.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{metric.detail}</p>
            </article>)}
          </section>
          <section className="mt-8 border-b border-border pb-7" aria-label="Evolución de ventas">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-primary">Evolución de ventas</h2><p className="mt-1 text-sm text-muted-foreground">{view === "diaria" ? "Últimos 7 días" : view === "semanal" ? "Últimas 8 semanas · lunes a domingo" : "Últimos 6 meses"} · CUP</p></div>
              {data.change !== null && <span className="flex items-center gap-1 text-xs font-bold text-caramel">{data.change >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}{Math.abs(data.change).toFixed(1)}% frente al periodo anterior</span>}
            </div>
            <div className="mt-5 min-w-0 bg-card py-4">
              <ClientOnly fallback={<div className="h-72 sm:h-80" />}><Suspense fallback={<div className="h-72 sm:h-80" />}><SalesChart points={data.points} view={view} /></Suspense></ClientOnly>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">{data.byPayment.map((p) => <span key={p.payment}>{p.payment === "efectivo" ? "Efectivo" : "Transferencia"} <strong className="ml-1 text-foreground">{formatPrice(p.revenue)}</strong></span>)}</div>
            <details className="mt-4 text-sm"><summary className="cursor-pointer font-bold text-caramel">Ver cifras del gráfico</summary><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="py-2">Periodo</th><th>Ventas</th><th className="text-right">Importe</th></tr></thead><tbody>{data.points.map((p) => <tr key={p.date} className="border-b border-border"><td className="py-2">{dateLabel(p.date)}</td><td>{p.orders}</td><td className="text-right">{formatPrice(p.revenue)}</td></tr>)}</tbody></table></div></details>
          </section>
          <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <section className="min-w-0" aria-label="Productos más vendidos">
              <h2 className="text-xl font-bold text-primary">Productos más vendidos</h2><p className="mt-1 text-sm text-muted-foreground">Por unidades vendidas en el periodo</p>
              <div className="mt-5 space-y-1">{data.ranking.slice(0, 5).map((product, index) => {
                const image = getProduct(product.slug)?.image;
                return <div key={product.slug} className="flex items-center gap-3 border-b border-border py-4">
                  <span className="w-4 shrink-0 text-xs font-bold text-muted-foreground">{index + 1}</span>
                  {image ? <img src={image} alt={product.label} className="size-11 shrink-0 rounded-md object-cover" /> : <span className="grid size-11 shrink-0 place-items-center rounded-md bg-blush text-rosa-deep"><Package className="size-5" /></span>}
                  <div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-foreground">{product.label}</p><p className="mt-1 text-xs text-muted-foreground">{formatPrice(product.revenue)}</p></div>
                  <span className="shrink-0 text-right text-sm font-bold text-primary">{product.qty}<span className="block text-xs font-normal text-muted-foreground">unidades</span></span>
                </div>;
              })}{data.ranking.length === 0 && <p className="py-8 text-sm text-muted-foreground">Sin ventas en este periodo.</p>}</div>
            </section>
            <section aria-label="Alertas de reposición" className="min-w-0 rounded-lg border border-border bg-card p-5">
              <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-blush text-rosa-deep"><TriangleAlert className="size-5" /></span><div><h2 className="text-xl font-bold text-primary">Necesitan reposición</h2><p className="mt-1 text-xs text-muted-foreground">{alerts.length} alertas · existencias y mínimos de ejemplo</p></div></div>
              <div className="mt-5 flex flex-wrap gap-1" role="group" aria-label="Filtrar alertas">
                {([{ id: "todos", label: "Todos" }, { id: "producto", label: "Productos" }, { id: "insumo", label: "Insumos" }] as const).map((type) => <Button key={type.id} variant={alertType === type.id ? "secondary" : "ghost"} size="sm" aria-pressed={alertType === type.id} onClick={() => setAlertType(type.id)}>{type.label}</Button>)}
              </div>
              <ul className="mt-3 divide-y divide-border">{visibleAlerts.map((item) => <li key={item.id} className="py-4">
                <div className="flex items-start justify-between gap-3"><p className="flex min-w-0 items-start gap-2 text-sm font-extrabold text-foreground">{item.type === "producto" ? <Package className="mt-0.5 size-4 shrink-0 text-caramel" /> : <Boxes className="mt-0.5 size-4 shrink-0 text-caramel" />}{item.label}</p><span className={cn("shrink-0 rounded-md px-2 py-1 text-[10px] font-bold", item.stock === 0 ? "bg-blush text-rosa-deep" : "bg-secondary text-caramel")}>{item.stock === 0 ? "Agotado" : "Bajo"}</span></div>
                <p className="mt-2 text-xs text-muted-foreground">Disponible: <strong className="text-foreground">{item.stock} {item.unit}</strong><span className="mx-2">·</span>Mínimo: {item.minimum}</p>
                <p className="mt-1 text-xs font-bold text-caramel">Reponer {Number((item.minimum - item.stock).toFixed(2))} {item.unit}</p>
              </li>)}</ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}