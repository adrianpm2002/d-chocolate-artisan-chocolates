import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/pricing";
import { type SalesView } from "@/lib/sales-dashboard";

type Point = { date: string; label: string; revenue: number; orders: number };
const chartColor = "var(--rosa-deep)";
function SalesTooltip({ active, payload }: { active?: boolean; payload?: { payload?: Point }[] }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return <div className="rounded-lg border border-border bg-popover px-4 py-3 text-sm shadow-card">
    <p className="font-bold text-popover-foreground">{point.label}</p>
    <p className="mt-1 font-display text-lg font-bold text-primary">{formatPrice(point.revenue)}</p>
    <p className="text-muted-foreground">{point.orders} ventas</p>
  </div>;
}

export function SalesChart({ points, view }: { points: Point[]; view: SalesView }) {
  const axes = <>
    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
    <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} dy={8} />
    <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} width={48} tickFormatter={(value: number) => value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)} />
    <Tooltip content={<SalesTooltip />} cursor={false} />
  </>;
  return <div className="h-72 w-full sm:h-80" role="img" aria-label={`Gráfico de ventas ${view === "diaria" ? "diarias" : view === "semanal" ? "semanales" : "mensuales"} en CUP`}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      {view === "diaria" ? <LineChart data={points} margin={{ top: 20, right: 16, left: 0, bottom: 16 }}>
        {axes}<Line type="monotone" dataKey="revenue" name="Ventas" stroke={chartColor} strokeWidth={3} dot={{ r: 4, fill: chartColor, stroke: "var(--card)", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
      </LineChart> : <BarChart data={points} margin={{ top: 20, right: 16, left: 0, bottom: 16 }}>
        {axes}<Bar dataKey="revenue" name="Ventas" fill={chartColor} radius={[4, 4, 0, 0]} maxBarSize={42} isAnimationActive={false} />
      </BarChart>}
    </ResponsiveContainer>
  </div>;
}