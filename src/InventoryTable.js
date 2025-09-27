import React, { useState } from 'react';

export default function InventoryTable({ inventory, setInventory }) {
  const [expandedSections, setExpandedSections] = useState({});

  const sections = inventory.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  function toggleSection(section) {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  function toggleSelect(section, itemIndex) {
    const newInventory = [...inventory];
    const item = sections[section][itemIndex];
    const globalIndex = newInventory.findIndex((i) => i === item);
    newInventory[globalIndex].selected = !newInventory[globalIndex].selected;
    setInventory(newInventory);
  }

  function handleChange(section, itemIndex, field, value) {
    const newInventory = [...inventory];
    const item = sections[section][itemIndex];
    const globalIndex = newInventory.findIndex((i) => i === item);
    newInventory[globalIndex][field] = value;
    setInventory(newInventory);
  }

  function removeItem(section, itemIndex) {
    const newInventory = [...inventory];
    const item = sections[section][itemIndex];
    const globalIndex = newInventory.findIndex((i) => i === item);
    newInventory.splice(globalIndex, 1);
    setInventory(newInventory);
  }

  function addNewItem() {
    // Add new item to the last section or to a "New Section"
    const newInventory = [...inventory];
    let sectionNames = Object.keys(sections);
    const lastSection = sectionNames.length ? sectionNames[sectionNames.length - 1] : "New Section";

    newInventory.push({
      section: lastSection,
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
    <div className="accordion" id="inventoryAccordion">
      <h2>Inventory</h2>
      <button onClick={addNewItem} className="btn btn-primary mb-3">Add New Item</button>
      {Object.entries(sections).map(([section, items], index) => (
        <div className="accordion-item" key={section}>
          <h2 className="accordion-header" id={`heading${index}`}>
            <button
              className={`accordion-button ${!expandedSections[section] ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection(section)}
              aria-expanded={expandedSections[section] ? 'true' : 'false'}
              aria-controls={`collapse${index}`}
            >
              {section}
            </button>
          </h2>
          <div
            id={`collapse${index}`}
            className={`accordion-collapse collapse ${expandedSections[section] ? 'show' : ''}`}
            aria-labelledby={`heading${index}`}
            data-bs-parent="#inventoryAccordion"
          >
            <div className="accordion-body p-0">
              <table className="table table-striped m-0">
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Product</th>
                    <th>Description</th>
                    <th>Unit Price ($)</th>
                    <th>Count</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="checkbox"
                          checked={item.selected || false}
                          onChange={() => toggleSelect(section, idx)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={item.product}
                          onChange={e => handleChange(section, idx, 'product', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={item.description}
                          onChange={e => handleChange(section, idx, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={item.unitPrice}
                          onChange={e => handleChange(section, idx, 'unitPrice', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          type="number"
                          min="0"
                          value={item.count}
                          onChange={e => handleChange(section, idx, 'count', e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeItem(section, idx)}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
