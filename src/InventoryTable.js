import React, { useState, useEffect } from 'react';

export default function InventoryTable({ inventory = [], setInventory }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [addNewInputs, setAddNewInputs] = useState({});
  // For editing product field
  const [editingProduct, setEditingProduct] = useState({ section: null, index: null });
  const [productEditValue, setProductEditValue] = useState('');

  const sections = inventory.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  useEffect(() => {
    setAddNewInputs(prev =>
      Object.keys(sections).reduce((a, s) => {
        a[s] = prev[s] || { product: '', price: '', count: '' };
        return a;
      }, {})
    );
  }, [inventory]);

  function toggleSection(section) {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  function handleAddInputChange(section, field, value) {
    setAddNewInputs(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }

  function addNewItemToSection(section) {
    const { product, price, count } = addNewInputs[section];
    if (!product.trim()) {
      alert('Please enter a product name.');
      return;
    }
    const unitPrice = price.trim() === '' ? '0' : price.trim().replace(/[^0-9.]/g, '');
    const quantity = count === '' ? 0 : parseInt(count, 10);

    const newInventory = [...inventory, {
      section,
      product: product.trim(),
      unitPrice,
      count: quantity,
      description: '',
      selected: false,
      askCount: 0,
    }];
    const sectionNames = Object.keys(sections);
    newInventory.sort((a, b) => {
      const aIdx = sectionNames.indexOf(a.section);
      const bIdx = sectionNames.indexOf(b.section);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.product.localeCompare(b.product, undefined, { sensitivity: 'base' });
    });
    setInventory(newInventory);
    setAddNewInputs(prev => ({
      ...prev,
      [section]: { product: '', price: '', count: '' },
    }));
  }

  function toggleSelect(section, index) {
    const items = sections[section];
    const item = items[index];
    const newInventory = [...inventory];
    const globalIndex = newInventory.findIndex(i => i === item);
    newInventory[globalIndex].selected = !newInventory[globalIndex].selected;
    setInventory(newInventory);
  }

  function handleChange(section, index, field, value) {
    const items = sections[section];
    const item = items[index];
    const newInventory = [...inventory];
    const globalIndex = newInventory.findIndex(i => i === item);
    if (field === 'unitPrice') {
      newInventory[globalIndex][field] = value.replace(/[^0-9.]/g, '');
    } else {
      newInventory[globalIndex][field] = value;
    }
    setInventory(newInventory);
  }

  function removeItem(section, index) {
    const items = sections[section];
    const item = items[index];
    const newInventory = [...inventory];
    const globalIndex = newInventory.findIndex(i => i === item);
    newInventory.splice(globalIndex, 1);
    setInventory(newInventory);
  }

  // Product cell edit handlers
  function handleProductCellClick(section, index, originalValue) {
    setEditingProduct({ section, index });
    setProductEditValue(originalValue);
  }

  function handleProductCommit(section, index) {
    handleChange(section, index, 'product', productEditValue.trim());
    setEditingProduct({ section: null, index: null });
    setProductEditValue('');
  }

  function handleProductCancel() {
    setEditingProduct({ section: null, index: null });
    setProductEditValue('');
  }

  const adjustableFontSize = '1.08rem';

  return (
    <div className="accordion" id="inventoryAccordion">
      {Object.entries(sections).map(([section, items], idx) => (
        <div className="accordion-item" key={section}>
          <h2 className="accordion-header" id={`heading${idx}`}>
            <button
              className={`accordion-button ${!expandedSections[section] ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection(section)}
              aria-expanded={!!expandedSections[section]}
              aria-controls={`collapse${idx}`}
              style={{ fontWeight: '700' }}
            >
              {section}
            </button>
          </h2>
          <div
            id={`collapse${idx}`}
            className={`accordion-collapse collapse ${expandedSections[section] ? 'show' : ''}`}
            aria-labelledby={`heading${idx}`}
            data-bs-parent="#inventoryAccordion"
          >
            <div className="accordion-body p-0">
              {/* Table */}
              <div className="table-responsive">
                <table className="table table-bordered table-striped text-center align-middle mb-2" style={{ width: '100%', fontWeight: 700, borderCollapse: 'collapse', tableLayout: 'auto' }}>
                  <thead>
                    <tr style={{ background: '#bababa' }}>
                      <th style={{ width: '7%' }}></th>
                      <th style={{ width: '44%' }} className="product">Product</th>
                      <th style={{ width: '18%' }}>Price ($)</th>
                      <th style={{ width: '12%' }}>Qt</th>
                      <th style={{ width: '14%' }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={item.selected || false}
                            onChange={() => toggleSelect(section, index)}
                            style={{ width: 24, height: 24, cursor: 'pointer' }}
                          />
                        </td>
                        <td
                          className="product"
                          style={{
                            fontWeight: 700,
                            textAlign: 'left',
                            whiteSpace: 'pre-line',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            fontSize: adjustableFontSize,
                            maxWidth: 430,
                            cursor: editingProduct.section === section && editingProduct.index === index ? 'text' : 'pointer',
                            background: editingProduct.section === section && editingProduct.index === index ? '#f5f5f5' : ''
                          }}
                          onClick={() =>
                            editingProduct.section !== section || editingProduct.index !== index
                              ? handleProductCellClick(section, index, item.product)
                              : undefined
                          }
                        >
                          {editingProduct.section === section && editingProduct.index === index ? (
                            <input
                              className="form-control"
                              value={productEditValue}
                              onChange={e => setProductEditValue(e.target.value)}
                              onBlur={() => handleProductCommit(section, index)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleProductCommit(section, index);
                                if (e.key === 'Escape') handleProductCancel();
                              }}
                              autoFocus
                              style={{
                                fontWeight: 700,
                                fontSize: adjustableFontSize,
                                minWidth: 100,
                                maxWidth: 430,
                              }}
                            />
                          ) : (
                            <span tabIndex={0} title={item.product}>
                              {item.product}
                            </span>
                          )}
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            type="number"
                            inputMode="decimal"
                            min="0"
                            value={item.unitPrice}
                            onChange={e => handleChange(section, index, 'unitPrice', e.target.value)}
                            onFocus={e => { e.target.placeholder = ''; e.target.value = ''; }}
                            onBlur={e => {
                              // Only format if value is not blank
                              if (e.target.value !== "" && /^\d+$/.test(e.target.value)) {
                                e.target.value = Number(e.target.value).toFixed(2);
                                handleChange(section, index, 'unitPrice', e.target.value);
                              }
                            }}
                            style={{ fontSize: '1rem', maxWidth: 80, margin: '0 auto', textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <input
                            className="form-control form-control-sm"
                            type="number"
                            inputMode="numeric"
                            min="0"
                            value={item.count}
                            onChange={e => handleChange(section, index, 'count', e.target.value)}
                            onFocus={e => { e.target.placeholder = ''; e.target.value = ''; }}
                            style={{ fontSize: '1rem', maxWidth: 80, margin: '0 auto', textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => removeItem(section, index)}
                            style={{ fontWeight: 700 }}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Add new item form for this section */}
              <div className="mb-2 border rounded p-2 bg-light mx-2">
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-5">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Product Name"
                      value={addNewInputs[section]?.product ?? ''}
                      onChange={e => handleAddInputChange(section, 'product', e.target.value)}
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="form-control form-control-sm"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={addNewInputs[section]?.price ?? ''}
                      onChange={e => handleAddInputChange(section, 'price', e.target.value)}
                      onFocus={e => { e.target.placeholder = ''; e.target.value = ''; }}
                    />
                  </div>
                  <div className="col-6 col-md-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      className="form-control form-control-sm"
                      min="0"
                      placeholder="Qt"
                      value={addNewInputs[section]?.count ?? ''}
                      onChange={e => handleAddInputChange(section, 'count', e.target.value)}
                      onFocus={e => { e.target.placeholder = ''; e.target.value = ''; }}
                    />
                  </div>
                  <div className="col-12 col-md-2 d-flex align-items-center">
                    <button className="btn btn-primary w-100 btn-sm" onClick={() => addNewItemToSection(section)}>Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
