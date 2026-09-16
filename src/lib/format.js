export function fmtNum(num, digits = 2) {
  if (num === undefined || num === null || isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
}

export function fmtCompact(num, prefix = "$") {
  if (num === undefined || num === null || isNaN(num)) return "—";
  if (num >= 1_000_000_000) return `${prefix}${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${prefix}${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${prefix}${(num / 1_000).toFixed(1)}K`;
  return `${prefix}${Number(num).toFixed(2)}`;
}

export function fmtUsd(num) {
  return fmtCompact(num, "$");
}

export function fmtTokens(num, symbol = "") {
  return `${fmtCompact(num, "")} ${symbol}`.trim();
}
