import React, { useState, useEffect, useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Activity, ExternalLink, BarChart2, CandlestickChart, RefreshCw } from "lucide-react";
import { fmtNum, fmtCompact } from "../lib/format";
import { resolveTokenPair, fetchOnchainOhlcv, generateAccurateFallbackTimeline, formatChartPrice } from "../services/chartService";

export function PriceCandleChart({ token, currentPrice, priceChange }) {
  const [chartMode, setChartMode] = useState("candles"); // "candles" (TradingView embed) | "area" (Recharts on-chain)
  const [timeframe, setTimeframe] = useState("1h");
  const [pairInfo, setPairInfo] = useState(null);
  const [ohlcvData, setOhlcvData] = useState([]);
  const [loadingOhlcv, setLoadingOhlcv] = useState(false);
  const [loadingPair, setLoadingPair] = useState(false);

  const symbol = token?.symbol || "ARGUS";
  const color = token?.color || "#38bdf8";
  const baseP = currentPrice || token?.basePrice || 0;
  const numChange = parseFloat(priceChange ?? token?.priceChanges?.h24 ?? 0) || 0;

  // 1. Resolve trading pair for the token
  useEffect(() => {
    let isMounted = true;
    async function resolve() {
      setLoadingPair(true);
      try {
        const info = await resolveTokenPair(token);
        if (isMounted) setPairInfo(info);
      } catch (e) {
        console.warn("Pair resolution error:", e);
      } finally {
        if (isMounted) setLoadingPair(false);
      }
    }
    resolve();
    return () => { isMounted = false; };
  }, [token?.contract, token?.id, token?.pairAddress, token?.topPairUrl]);

  // 2. Fetch real on-chain OHLCV data when pair or timeframe changes
  useEffect(() => {
    let isMounted = true;
    if (!pairInfo?.pairAddress) return;

    async function loadBars() {
      setLoadingOhlcv(true);
      try {
        const bars = await fetchOnchainOhlcv(pairInfo.pairAddress, timeframe);
        if (isMounted) {
          if (bars && bars.length > 0) {
            setOhlcvData(bars);
          } else {
            // Fallback timeline anchored to real 24h change (no fake cliffs)
            setOhlcvData(generateAccurateFallbackTimeline(baseP, numChange, timeframe));
          }
        }
      } catch (e) {
        if (isMounted) {
          setOhlcvData(generateAccurateFallbackTimeline(baseP, numChange, timeframe));
        }
      } finally {
        if (isMounted) setLoadingOhlcv(false);
      }
    }

    loadBars();
    return () => { isMounted = false; };
  }, [pairInfo?.pairAddress, timeframe, baseP, numChange]);

  // 3. Compute chart dataset (fallback if ohlcvData is still empty)
  const activeChartData = useMemo(() => {
    if (ohlcvData && ohlcvData.length > 0) return ohlcvData;
    return generateAccurateFallbackTimeline(baseP, numChange, timeframe);
  }, [ohlcvData, baseP, numChange, timeframe]);

  // All price points for precision calculation
  const allPrices = useMemo(() => activeChartData.map((d) => d.price), [activeChartData]);
  const highPrice = useMemo(() => Math.max(...allPrices, baseP), [allPrices, baseP]);
  const lowPrice = useMemo(() => Math.min(...allPrices, baseP), [allPrices, baseP]);

  const embedUrl = pairInfo?.embedUrl || (
    token?.pairAddress 
      ? `https://dexscreener.com/arc/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0` 
      : null
  );

  return (
    <section className="card p-5 border-slate-800 bg-[#111622]">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Token Info & Price */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{symbol}/USDC</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {token?.dex || "Arc AMM"}
              </span>
              {pairInfo?.url && (
                <a
                  href={pairInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono hover:underline ml-1"
                  title="Open live on DexScreener"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden sm:inline">DexScreener</span>
                </a>
              )}
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="text-xl font-bold font-mono text-white">
                {formatChartPrice(baseP, allPrices)}
              </span>
              <span
                className={`text-xs font-mono font-semibold flex items-center px-1.5 py-0.5 rounded ${
                  numChange >= 0
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {numChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                )}
                {numChange >= 0 ? `+${fmtNum(numChange, 2)}%` : `${fmtNum(numChange, 2)}%`} 24h
              </span>
            </div>
          </div>
        </div>

        {/* View Mode & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Toggle: Candlestick (TV) vs Area */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setChartMode("candles")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                chartMode === "candles"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candles (TV)</span>
            </button>
            <button
              onClick={() => setChartMode("area")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                chartMode === "area"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Area (Depth)</span>
            </button>
          </div>

          {/* Timeframe Selector (for Area view) */}
          {chartMode === "area" && (
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              {["15m", "1h", "4h", "1D"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    timeframe === tf
                      ? "bg-slate-700 text-cyan-300 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">24h High</span>
          <span className="font-semibold text-slate-200">{formatChartPrice(highPrice, allPrices)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">24h Low</span>
          <span className="font-semibold text-slate-200">{formatChartPrice(lowPrice, allPrices)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">24h Volume</span>
          <span className="font-semibold text-cyan-400">${fmtCompact(token?.volume24h ?? 0)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Liquidity Depth</span>
          <span className="font-semibold text-slate-200">${fmtCompact(token?.liquidity ?? 0)}</span>
        </div>
      </div>

      {/* Main Chart Rendering Area */}
      <div className="relative w-full rounded-lg overflow-hidden border border-slate-800/60 bg-[#0c1017]">
        {chartMode === "candles" ? (
          embedUrl ? (
            <div className="w-full h-[450px]">
              <iframe
                title={`${symbol} TradingView Live Chart`}
                src={embedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                allow="clipboard-write"
              />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">
                Locating live AMM liquidity pool on Arc L1...
              </p>
            </div>
          )
        ) : (
          <div className="h-72 w-full p-2 pt-4">
            {loadingOhlcv ? (
              <div className="h-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mr-2" />
                <span className="text-xs font-mono text-slate-400">Loading on-chain OHLCV candles...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={35}
                  />
                  <YAxis
                    domain={["dataMin * 0.98", "dataMax * 1.02"]}
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => formatChartPrice(v, allPrices)}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0e14",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
                    }}
                    formatter={(val, name, item) => {
                      const payload = item?.payload || {};
                      return [
                        <div key="tip" className="space-y-1 font-mono text-xs">
                          <div><strong className="text-white">Price:</strong> {formatChartPrice(val, allPrices)} USDC</div>
                          {payload.high && <div><strong className="text-slate-400">High:</strong> {formatChartPrice(payload.high, allPrices)}</div>}
                          {payload.low && <div><strong className="text-slate-400">Low:</strong> {formatChartPrice(payload.low, allPrices)}</div>}
                          {payload.volume > 0 && <div><strong className="text-cyan-400">Volume:</strong> ${payload.volume.toLocaleString()}</div>}
                        </div>,
                        ""
                      ];
                    }}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#priceGlow)"
                    activeDot={{ r: 5, fill: "#38bdf8", stroke: "#0f172a", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
