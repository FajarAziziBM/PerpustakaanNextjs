import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ReportResult } from "./types";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica" },
  title: { fontSize: 14, marginBottom: 2, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 9, color: "#64748b", marginBottom: 14 },
  table: { display: "flex", flexDirection: "column", borderWidth: 1, borderColor: "#e2e8f0" },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#e2e8f0" },
  cell: { padding: 6, fontSize: 8 },
  headerCell: { padding: 6, fontSize: 8, fontFamily: "Helvetica-Bold" },
  footer: { marginTop: 12, fontSize: 8, color: "#94a3b8" },
});

interface ReportDocumentProps {
  title: string;
  subtitle?: string;
  columns: ReportResult["columns"];
  rows: string[][];
  generatedAt: Date;
}

function ReportDocument({ title, subtitle, columns, rows, generatedAt }: ReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        <View style={styles.table}>
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <Text key={col.key} style={[styles.headerCell, { flex: col.flex ?? 1 }]}>
                {col.header}
              </Text>
            ))}
          </View>

          {rows.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((value, ci) => (
                <Text key={ci} style={[styles.cell, { flex: columns[ci]?.flex ?? 1 }]}>
                  {value}
                </Text>
              ))}
            </View>
          ))}

          {rows.length === 0 && (
            <View style={styles.row}>
              <Text style={[styles.cell, { flex: 1 }]}>Tidak ada data.</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          Dicetak{" "}
          {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(generatedAt)} ·{" "}
          {rows.length} baris · SIPUS
        </Text>
      </Page>
    </Document>
  );
}

export async function renderReportPdf(report: ReportResult): Promise<Buffer> {
  const rows = report.rows.map((row) => report.columns.map((c) => String(row[c.key] ?? "")));

  return renderToBuffer(
    <ReportDocument
      title={report.title}
      subtitle={report.subtitle}
      columns={report.columns}
      rows={rows}
      generatedAt={new Date()}
    />
  );
}
