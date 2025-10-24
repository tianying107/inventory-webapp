import React, { useState, useEffect } from 'react';

function ceilToNextFive(amount) {
  return Math.ceil(amount / 5) * 5;
}

export default function InvoiceView({ stagedItems, discount = 10 }) {
  const [manualTotal, setManualTotal] = useState('');
  const [editingTotal, setEditingTotal] = useState(false);

  function sanitizePrice(price) {
    if (typeof price !== 'string') return price || 0;
    const cleaned = price.replace(/[^0-9.]/g, '');
    return cleaned === '' ? 0 : parseFloat(cleaned);
  }

  function formatPrice(val) {
    const num = parseFloat(val);
    return isNaN(num) ? '' : `$${num.toFixed(2)}`;
  }

  const invoiceRows = stagedItems
    .filter(item => item.askCount > 0)
    .map(item => {
      const priceNum = sanitizePrice(item.unitPrice);
      return {
        product: item.product,
        unitPrice: formatPrice(priceNum),
        quantity: item.askCount,
        subtotal: priceNum * item.askCount,
      };
    });

  const total = invoiceRows.reduce((sum, row) => sum + row.subtotal, 0);
  const discountFraction = 1 - (parseFloat(discount) || 0) / 100;
  const computedDiscountTotal = ceilToNextFive(total * discountFraction);

  useEffect(() => {
    setManualTotal('');
    setEditingTotal(false);
  }, [total, discount, stagedItems]);

  const totalStyle = {
    fontWeight: 900,
    fontSize: '1.15rem',
    minWidth: 100,
  };

  return (
    <div className="table-responsive">
      <table
        className="table table-bordered table-striped text-center align-middle mb-4"
        style={{
          width: '100%',
          fontWeight: 700,
          borderCollapse: 'collapse',
          tableLayout: 'auto',
        }}
      >
        <thead>
          <tr>
            <th
              colSpan={1}
              style={{ background: '#e6e6e6', ...totalStyle, width: '25%' }}
            >
              Total
            </th>
            <th
              colSpan={3}
              style={{ background: '#e6e6e6', ...totalStyle, width: '75%' }}
            >
              Final Total After Discounts
            </th>
          </tr>
          <tr>
            <th
              colSpan={1}
              style={{ background: '#fff', ...totalStyle, width: '25%', textAlign: 'center' }}
            >
              {formatPrice(total)}
            </th>
            <th
              colSpan={3}
              style={{ background: '#fff', ...totalStyle, width: '75%', textAlign: 'right' }}
            >
              {editingTotal ? (
                <input
                  type="number"
                  inputMode="decimal"
                  className="form-control form-control-sm d-inline text-end"
                  value={manualTotal}
                  onChange={e => setManualTotal(e.target.value)}
                  style={{
                    width: 90,
                    fontWeight: 900,
                    fontSize: '1.15rem',
                    display: 'inline-block',
                    border: '2px solid #000',
                    boxShadow: 'none',
                  }}
                  min="0"
                  placeholder={computedDiscountTotal}
                  onBlur={() => setEditingTotal(false)}
                  autoFocus
                />
              ) : (
                <span
                  tabIndex={0}
                  style={{
                    fontWeight: 900,
                    fontSize: '1.15rem',
                    borderBottom: '1px dashed #888',
                    cursor: 'pointer',
                    padding: '2px 8px',
                    display: 'inline-block',
                    width: 'auto',
                    minWidth: 90,
                    textAlign: 'right',
                  }}
                  onClick={() => setEditingTotal(true)}
                  onKeyDown={e =>
                    (e.key === 'Enter' || e.key === ' ') && setEditingTotal(true)
                  }
                  title="Click to edit"
                >
                  {formatPrice(manualTotal === '' ? computedDiscountTotal : manualTotal)}
                </span>
              )}
            </th>
          </tr>
          <tr style={{ background: '#bababa' }}>
            <th style={{ width: '55%' }}>Product</th>
            <th style={{ width: '15%' }}>Price</th>
            <th style={{ width: '10%' }}>Qt</th>
            <th style={{ width: '20%' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {invoiceRows.map((row, idx) => (
            <tr key={idx}>
              <td
                style={{
                  fontWeight: 700,
                  textAlign: 'left',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  fontSize: '1.08rem',
                }}
                title={row.product}
              >
                {row.product}
              </td>
              <td style={{ fontWeight: 700 }}>{row.unitPrice}</td>
              <td style={{ fontWeight: 700 }}>{row.quantity}</td>
              <td style={{ fontWeight: 700 }}>{formatPrice(row.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
