export interface PdfColumn {
  header: string
  key: string
}

export interface PdfExportOptions {
  orientation?: 'p' | 'l'
  title?: string
}

// Basit ve tekrar kullanılabilir PDF tablo dışa aktarımı
export async function exportToPdf(
  data: any[],
  columns: PdfColumn[],
  filename: string,
  options?: PdfExportOptions
) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableModule.default

  const doc = new jsPDF({
    orientation: options?.orientation ?? 'l',
    unit: 'pt',
    format: 'a4',
  })

  const title = options?.title ?? filename
  doc.setFontSize(14)
  doc.text(title, 40, 40)

  autoTable(doc, {
    startY: 60,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => row[col.key] ?? '')),
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Tailwind blue-600
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 40, right: 40 },
  })

  doc.save(`${filename}.pdf`)
}


