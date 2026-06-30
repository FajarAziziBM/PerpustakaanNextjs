interface HBarChartProps {
  data: { label: string; count: number }[];
}

const BAR_H = 20;
const BAR_GAP = 8;
const LABEL_W = 110;
const COUNT_W = 32;
const BAR_MAX_W = 220;
const PAD = { top: 8, right: COUNT_W + 8, bottom: 8, left: LABEL_W + 8 };

export function HBarChart({ data }: HBarChartProps) {
  if (data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalH = PAD.top + data.length * (BAR_H + BAR_GAP) - BAR_GAP + PAD.bottom;
  const totalW = PAD.left + BAR_MAX_W + PAD.right;

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      className="w-full"
      aria-label="Top kategori berdasarkan jumlah buku"
      role="img"
    >
      {data.map((d, i) => {
        const y = PAD.top + i * (BAR_H + BAR_GAP);
        const barW = Math.max(4, (d.count / maxCount) * BAR_MAX_W);

        return (
          <g key={d.label}>
            {/* Label kiri */}
            <text x={LABEL_W} y={y + BAR_H / 2 + 4} textAnchor="end" fontSize={10} fill="#475569">
              {d.label.length > 16 ? d.label.slice(0, 15) + "…" : d.label}
            </text>

            {/* Bar */}
            <rect x={PAD.left} y={y} width={barW} height={BAR_H} fill="#2563eb" rx={3}>
              <title>{`${d.label}: ${d.count} buku`}</title>
            </rect>

            {/* Count kanan */}
            <text x={PAD.left + barW + 6} y={y + BAR_H / 2 + 4} fontSize={10} fill="#64748b">
              {d.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
