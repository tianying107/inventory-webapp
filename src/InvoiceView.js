import React from 'react';

export default function InvoiceView({ stagedItems }) {
  const itemsToInvoice = stagedItems.filter(item => item.askCount > 0);

  const total = itemsToInvoice.reduce(
    (sum, item) => sum + item.askCount * parseFloat(item.unitPrice.replace('$', '') || 0),
    0
  );

  return (
    <div>
      <h2>Invoice</h2>
      {itemsToInvoice.length === 0 && <p>No items to invoice.</p>}
      {itemsToInvoice.length > 0 && (
        <>
          <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Section</th>
                <th>Product</th>
                <th>Description</th>
                <th>Unit Price ($)</th>
                <th>Quantity</th>
                <th>Subtotal ($)</th>
              </tr>
            </thead>
            <tbody>
              {itemsToInvoice.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.section}</td>
                  <td>{item.product}</td>
                  <td>{item.description}</td>
                  <td>{item.unitPrice}</td>
                  <td>{item.askCount}</td>
                  <td>{(item.askCount * parseFloat(item.unitPrice.replace('$', '') || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total: ${total.toFixed(2)}</h3>
        </>
      )}
    </div>
  );
}
