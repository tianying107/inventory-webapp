import React from 'react';

export default function StageView({ stagedItems, setStagedItems }) {
  function updateAskCount(index, value) {
    const newItems = [...stagedItems];
    newItems[index].askCount = Math.max(0, parseInt(value) || 0);
    setStagedItems(newItems);
  }

  return (
    <div>
      <h2>Staged Items</h2>
      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Section</th>
            <th>Product</th>
            <th>Description</th>
            <th>Unit Price ($)</th>
            <th>In Stock</th>
            <th>Qty To Order</th>
          </tr>
        </thead>
        <tbody>
          {stagedItems.map((item, idx) => (
            <tr key={idx}>
              <td>{item.section}</td>
              <td>{item.product}</td>
              <td>{item.description}</td>
              <td>{item.unitPrice}</td>
              <td>{item.count}</td>
              <td>
                <input
                  type="number"
                  value={item.askCount}
                  onChange={e => updateAskCount(idx, e.target.value)}
                  min="0"
                  max={item.count}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
