export function fmtNum(num, digits = 2) {
  if (num === undefined || num === null || isNaN(num)) return "—";
  let d = digits;
  if (num > 0 && num < 0.0001) {
    d = Math.max(digits, 7);
  } else if (num > 0 && num < 0.001) {
    d = Math.max(digits, 6);
  } else if (num > 0 && num < 0.01) {
    d = Math.max(digits, 5);
  } else if (num > 0 && num < 0.1) {
    d = Math.max(digits, 4);
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
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
