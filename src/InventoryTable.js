import React from 'react';

export default function InventoryTable({ inventory, setInventory }) {
  console.log('InventoryTable received inventory:', inventory);

  function toggleSelect(index) {
    const newInventory = [...inventory];
    newInventory[index].selected = !newInventory[index].selected;
    setInventory(newInventory);
  }

  function handleChange(index, field, value) {
    const newInventory = [...inventory];
    newInventory[index][field] = value;
    setInventory(newInventory);
  }

  function removeItem(index) {
    const newInventory = [...inventory];
    newInventory.splice(index, 1);
    setInventory(newInventory);
  }

  function addNewItem() {
    const newInventory = [...inventory];
    newInventory.push({
      section: '',
      product: '',
      description: '',
      unitPrice: '',
      count: 0,
      selected: false,
      askCount: 0,
    });
    setInventory(newInventory);
  }

  return (
    <div>
      <h2>Inventory</h2>
      <button onClick={addNewItem}>Add New Item</button>
      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>Select</th>
            <th>Section</th>
            <th>Product</th>
            <th>Description</th>
            <th>Unit Price ($)</th>
            <th>Count</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item, idx) => (
            <tr key={idx}>
              <td>
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelect(idx)}
                />
              </td>
              <td>
                <input
                  value={item.section}
                  onChange={e => handleChange(idx, 'section', e.target.value)}
                />
              </td>
              <td>
                <input
                  value={item.product}
                  onChange={e => handleChange(idx, 'product', e.target.value)}
                />
              </td>
              <td>
                <input
                  value={item.description}
                  onChange={e => handleChange(idx, 'description', e.target.value)}
                />
              </td>
              <td>
                <input
                  value={item.unitPrice}
                  onChange={e => handleChange(idx, 'unitPrice', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.count}
                  onChange={e => handleChange(idx, 'count', e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => removeItem(idx)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
