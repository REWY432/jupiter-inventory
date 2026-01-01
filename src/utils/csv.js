import Papa from 'papaparse'

// Export to CSV
export function exportToCSV(data, filename, headers) {
  const csv = Papa.unparse(data, { header: true })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Import from CSV
export function importFromCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          resolve(results.data)
        } else {
          reject(new Error('Файл пуст или не распознан'))
        }
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

// Get flexible value from row (case-insensitive)
export function getFlexibleValue(row, possibleKeys) {
  for (const key of possibleKeys) {
    const found = Object.keys(row).find(rk => 
      rk.toLowerCase().trim() === key.toLowerCase()
    )
    if (found && row[found]) return row[found]
  }
  return null
}

