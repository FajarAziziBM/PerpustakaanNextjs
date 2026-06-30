interface DonutChartProps {
  dipinjam: number;
  selesai: number;
}

const R = 52;
const STROKE = 18;
const CX = 70;
const CY = 70;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function DonutChart({ dipinjam, selesai }: DonutChartProps) {
  const total = dipinjam + selesai;
  const pctDipinjam = total === 0 ? 0 : dipinjam / total;
  const pctSelesai = total === 0 ? 1 : selesai / total;

  const dashDipinjam = CIRCUMFERENCE * pctDipinjam;
  const dashSelesai = CIRCUMFERENCE * pctSelesai;
  const offsetSelesai = CIRCUMFERENCE * (1 - pctSelesai);

  return (
    <svg viewBox="0 0 140 140" className="w-36 shrink-0" aria-label="Rasio status peminjaman" role="img">
      {/* Track */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />

      {/* Selesai (hijau) */}
      {pctSelesai > 0 && (
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#10b981"
          strokeWidth={STROKE}
          strokeDasharray={`${dashSelesai} ${CIRCUMFERENCE - dashSelesai}`}
          strokeDashoffset={CIRCUMFERENCE * 0.25}
          transform={`rotate(0 ${CX} ${CY})`}
        >
          <title>{`Selesai: ${selesai}`}</title>
        </circle>
      )}

      {/* Dipinjam (biru) */}
      {pctDipinjam > 0 && (
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#2563eb"
          strokeWidth={STROKE}
          strokeDasharray={`${dashDipinjam} ${CIRCUMFERENCE - dashDipinjam}`}
          strokeDashoffset={CIRCUMFERENCE * 0.25 - dashSelesai}
        >
          <title>{`Dipinjam: ${dipinjam}`}</title>
        </circle>
      )}

      {/* Center text */}
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize={18} fontWeight="bold" fill="#0f172a">
        {total.toLocaleString("id-ID")}
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fontSize={9} fill="#64748b">
        total transaksi
      </text>

      {/* Legend */}
      <rect x={8} y={120} width={8} height={8} fill="#2563eb" rx={2} />
      <text x={20} y={128} fontSize={9} fill="#475569">
        Dipinjam ({dipinjam})
      </text>
      <rect x={8} y={131} width={8} height={8} fill="#10b981" rx={2} />
      <text x={20} y={139} fontSize={9} fill="#475569">
        Selesai ({selesai})
      </text>
    </svg>
  );
}
