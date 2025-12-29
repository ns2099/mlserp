// Excel export utility functions

export interface ExcelColumn {
  header: string
  key: string
  width?: number
}

export type ExcelFormatRule =
  | { key: string; type: 'date'; locale?: string }
  | {
      key: string
      type: 'currency'
      locale?: string
      currency: string
      minimumFractionDigits?: number
    }
  | {
      key: string
      type: 'number'
      locale?: string
      minimumFractionDigits?: number
      maximumFractionDigits?: number
    }
  | { key: string; type: 'text' }

export interface ExcelExportOptions {
  delimiter?: string
  includeBom?: boolean
  rules?: ExcelFormatRule[]
  filenameOverride?: string
}

const DEFAULT_OPTIONS: Required<Pick<ExcelExportOptions, 'delimiter' | 'includeBom'>> = {
  delimiter: ';',
  includeBom: true,
}

// Tek bir format fonksiyonu ile tüm sütunlar için kurallar uygula
function formatCellValue(value: any, key: string, rules?: ExcelFormatRule[]) {
  const rule = rules?.find((r) => r.key === key)
  if (!rule) {
    return value ?? ''
  }

  if (value === null || value === undefined || value === '') {
    return ''
  }

  switch (rule.type) {
    case 'date': {
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(rule.locale ?? 'tr-TR')
    }
    case 'currency': {
      const numberValue = typeof value === 'number' ? value : Number(value)
      if (Number.isNaN(numberValue)) return ''
      return new Intl.NumberFormat(rule.locale ?? 'tr-TR', {
        style: 'currency',
        currency: rule.currency,
        minimumFractionDigits: rule.minimumFractionDigits ?? 2,
      }).format(numberValue)
    }
    case 'number': {
      const numberValue = typeof value === 'number' ? value : Number(value)
      if (Number.isNaN(numberValue)) return ''
      return new Intl.NumberFormat(rule.locale ?? 'tr-TR', {
        minimumFractionDigits: rule.minimumFractionDigits ?? 0,
        maximumFractionDigits: rule.maximumFractionDigits ?? rule.minimumFractionDigits ?? 2,
      }).format(numberValue)
    }
    case 'text':
    default:
      return String(value)
  }
}

// Hücreyi CSV için güvenli hale getir
function serializeForCsv(value: any, delimiter: string) {
  const strValue = value != null ? String(value) : ''
  if (
    strValue.includes(delimiter) ||
    strValue.includes('"') ||
    strValue.includes('\n')
  ) {
    return `"${strValue.replace(/"/g, '""')}"`
  }
  return strValue
}

export function exportToExcel(
  data: any[],
  columns: ExcelColumn[],
  filename: string,
  options?: ExcelExportOptions
) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const delimiter = mergedOptions.delimiter

  const formattedRows = data.map((row) =>
    columns.reduce<Record<string, string>>((acc, column) => {
      acc[column.key] = formatCellValue(row[column.key], column.key, mergedOptions.rules)
      return acc
    }, {})
  )

  const headers = columns.map((col) => col.header).join(delimiter)
  const rows = formattedRows.map((row) =>
    columns.map((col) => serializeForCsv(row[col.key], delimiter)).join(delimiter)
  )

  const csvContent = [headers, ...rows].join('\n')

  const BOM = mergedOptions.includeBom ? '\uFEFF' : ''
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${mergedOptions.filenameOverride ?? filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
