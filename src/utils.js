export function arrayToCsv(data) {
    if (data.length === 0) return '';
  
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // header row
      ...data.map(row => headers.map(fieldName => {
        let value = row[fieldName] === undefined || row[fieldName] === null ? '' : row[fieldName];
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value.replace(/"/g, '""')}"`; // escape quotes
        }
        return value;
      }).join(','))
    ];
    return csvRows.join('\n');
  }
  