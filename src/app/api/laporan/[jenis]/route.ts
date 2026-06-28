import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getLaporanBuku } from "@/lib/reports/buku";
import { getLaporanAnggota } from "@/lib/reports/anggota";
import { getLaporanPeminjaman } from "@/lib/reports/peminjaman";
import { getLaporanPengembalian } from "@/lib/reports/pengembalian";
import { getLaporanDenda } from "@/lib/reports/denda";
import { buildExcelBuffer } from "@/lib/reports/excel";
import { renderReportPdf } from "@/lib/reports/pdf";
import type { DateRange, ReportResult } from "@/lib/reports/types";

const REPORT_LOADERS: Record<string, (range: DateRange) => Promise<ReportResult>> = {
  buku: getLaporanBuku,
  anggota: getLaporanAnggota,
  peminjaman: getLaporanPeminjaman,
  pengembalian: getLaporanPengembalian,
  denda: getLaporanDenda,
};

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

interface RouteParams {
  params: Promise<{ jenis: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Pemeriksaan otoritatif — modul Laporan khusus Admin (PRD §4).
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return NextResponse.json({ message: "Tidak diizinkan." }, { status: 403 });
  }

  const { jenis } = await params;
  const loader = REPORT_LOADERS[jenis];
  if (!loader) {
    return NextResponse.json({ message: "Jenis laporan tidak dikenal." }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") === "excel" ? "excel" : "pdf";
  const from = parseDate(searchParams.get("from"));
  const toRaw = searchParams.get("to");
  // Set ke akhir hari agar tanggal "to" ikut tercakup penuh.
  const to = toRaw ? new Date(`${toRaw}T23:59:59.999`) : undefined;

  const report = await loader({ from, to });
  const todayStr = new Date().toISOString().slice(0, 10);
  const filenameBase = `laporan-${jenis}-${todayStr}`;

  if (format === "excel") {
    const buffer = await buildExcelBuffer(report);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  }

  const pdfBuffer = await renderReportPdf(report);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
    },
  });
}
