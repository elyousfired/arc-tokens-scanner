import React, { useState, useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { fmtNum } from "../lib/format";

export function PriceCandleChart({ token, currentPrice, priceChange }) {
  const [timeframe, setTimeframe] = useState("1h");
  const symbol = token?.symbol || "ARGUS";
  const color = token?.color || "#38bdf8";
  const baseP = currentPrice || token?.basePrice || 0;

  const chartData = useMemo(() => {
    const points = timeframe === "15m" ? 24 : timeframe === "1h" ? 48 : timeframe === "4h" ? 60 : 30;
    const data = [];
    let price = baseP * (1 - (priceChange || 0) / 100 * 0.7);

    for (let i = 0; i < points; i++) {
      const volatility = (Math.random() - 0.48) * (baseP * 0.04);
      price = Math.max(baseP * 0.3, price + volatility);
      if (i === points - 1) price = baseP;

      const timeLabel = timeframe === "1D" ? `Day -${points - i}` : `${(i * (timeframe === "15m" ? 15 : timeframe === "1h" ? 60 : 240)) % 1440}m`;
      data.push({
        time: timeLabel,
        price: Number(price.toFixed(5)),
        high: Number((price * 1.015).toFixed(5)),
        low: Number((price * 0.985).toFixed(5)),
        volume: Math.round(Math.random() * 50000 + 10000),
      });
    }
    return data;
  }, [baseP, priceChange, timeframe]);

  return (
    <section className="card p-5 border-slate-800 bg-[#111622]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{symbol}/USDC</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                Arc AMM
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-bold font-mono text-white">${fmtNum(baseP, 4)}</span>
              <span className={`text-xs font-mono font-semibold flex items-center ${
                (priceChange ?? 0) >= 0 ? "text-green-400" : "text-red-400"
              }`}>
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {(priceChange ?? 0) >= 0 ? `+${fmtNum(priceChange || 0, 1)}%` : `${fmtNum(priceChange, 1)}%`} 24h
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          {["15m", "1h", "4h", "1D"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeframe === tf
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
            <YAxis
              domain={["auto", "auto"]}
              stroke="#475569"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(4)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b0e14",
                borderColor: "#334155",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(val) => [`$${Number(val).toFixed(5)} USDC`, "Spot Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
