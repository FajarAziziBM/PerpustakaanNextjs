import type { MonthlyPoint } from "@/lib/chart-data";

interface BarChartProps {
  data: MonthlyPoint[];
}

const W = 700;
const H = 240;
const PAD = { top: 20, right: 16, bottom: 48, left: 44 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

const COLOR_P = "#2563eb"; // brand-600
const COLOR_K = "#10b981"; // emerald-500

function niceMax(n: number): number {
  if (n === 0) return 5;
  const exp = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / exp) * exp;
}

export function BarChart({ data }: BarChartProps) {
  const maxVal = niceMax(Math.max(...data.map((d) => Math.max(d.peminjaman, d.pengembalian)), 1));
  const n = data.length;
  const groupW = CHART_W / n;
  const barW = Math.max(4, groupW * 0.28);
  const gap = barW * 0.5;

  const TICKS = 5;
  const yTicks = Array.from({ length: TICKS + 1 }, (_, i) => (maxVal / TICKS) * i);

  function barX(i: number, offset: number) {
    return PAD.left + groupW * i + groupW / 2 - gap / 2 - barW + offset;
  }

  function barY(val: number) {
    return PAD.top + CHART_H - (val / maxVal) * CHART_H;
  }

  function barH(val: number) {
    return (val / maxVal) * CHART_H;
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      aria-label="Grafik peminjaman dan pengembalian per bulan"
      role="img"
    >
      {/* Grid & y-axis */}
      {yTicks.map((tick) => {
        const y = PAD.top + CHART_H - (tick / maxVal) * CHART_H;
        return (
          <g key={tick}>
            <line x1={PAD.left} y1={y} x2={PAD.left + CHART_W} y2={y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
              {tick}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => (
        <g key={d.label}>
          {/* Peminjaman bar */}
          {d.peminjaman > 0 && (
            <rect
              x={barX(i, 0)}
              y={barY(d.peminjaman)}
              width={barW}
              height={barH(d.peminjaman)}
              fill={COLOR_P}
              rx={2}
            >
              <title>{`${d.label} — Peminjaman: ${d.peminjaman}`}</title>
            </rect>
          )}
          {/* Pengembalian bar */}
          {d.pengembalian > 0 && (
            <rect
              x={barX(i, barW + gap)}
              y={barY(d.pengembalian)}
              width={barW}
              height={barH(d.pengembalian)}
              fill={COLOR_K}
              rx={2}
            >
              <title>{`${d.label} — Pengembalian: ${d.pengembalian}`}</title>
            </rect>
          )}
          {/* x-axis label */}
          <text
            x={PAD.left + groupW * i + groupW / 2}
            y={H - PAD.bottom + 16}
            textAnchor="middle"
            fontSize={10}
            fill="#64748b"
          >
            {d.label}
          </text>
        </g>
      ))}

      {/* x-axis line */}
      <line
        x1={PAD.left}
        y1={PAD.top + CHART_H}
        x2={PAD.left + CHART_W}
        y2={PAD.top + CHART_H}
        stroke="#e2e8f0"
        strokeWidth={1}
      />

      {/* Legend */}
      <rect x={PAD.left} y={H - 14} width={10} height={10} fill={COLOR_P} rx={2} />
      <text x={PAD.left + 14} y={H - 5} fontSize={10} fill="#475569">
        Peminjaman
      </text>
      <rect x={PAD.left + 90} y={H - 14} width={10} height={10} fill={COLOR_K} rx={2} />
      <text x={PAD.left + 104} y={H - 5} fontSize={10} fill="#475569">
        Pengembalian
      </text>
    </svg>
  );
}
