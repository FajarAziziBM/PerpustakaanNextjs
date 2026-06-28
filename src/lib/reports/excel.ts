import ExcelJS from "exceljs";
import type { ReportResult } from "./types";

export async function buildExcelBuffer(report: ReportResult): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SIPUS";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(report.title.slice(0, 31));

  sheet.columns = report.columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 20,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
  };

  report.rows.forEach((row) => sheet.addRow(row));

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
