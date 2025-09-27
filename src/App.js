import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import InventoryTable from './InventoryTable';
import StageView from './StageView';
import InvoiceView from './InvoiceView';
import { arrayToCsv } from './utils';

const STORAGE_KEY = 'inventory-data-v1';

function fetchCSV(url) {
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
      });
      return result.data.map(row => ({
        section: row.Section || '',
        product: row.Product || '',
        unitPrice: row['Unit Price'] || '',
        count: parseInt(row.Count, 10) || 0,
        description: row.Description || '',
        selected: false,
        askCount: 0,
      }));
    })
    .catch(() => []);
}

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [stagedItems, setStagedItems] = useState([]);

  useEffect(() => {
    const storedInventory = localStorage.getItem(STORAGE_KEY);
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    } else {
      fetchCSV('/Inventory.csv').then(data => setInventory(data));
    }
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    }
  }, [inventory]);

  function generateStage() {
    const selectedItems = inventory.filter(item => item.selected);
    setStagedItems(selectedItems.map(item => ({ ...item, askCount: 0 })));
  }

  function exportInvoice() {
    const filteredItems = stagedItems.filter(item => item.askCount > 0).map(item => ({
      Section: item.section,
      Product: item.product,
      Description: item.description,
      'Unit Price': item.unitPrice,
      Quantity: item.askCount,
      Subtotal: (item.askCount * parseFloat(item.unitPrice.replace('$', ''))).toFixed(2),
    }));
    const csv = arrayToCsv(filteredItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportInventory() {
    const csv = arrayToCsv(inventory);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function resetInventory() {
    localStorage.removeItem(STORAGE_KEY);
    fetchCSV('/Inventory.csv').then(data => setInventory(data));
  }

  return (
    <div className="container my-4">
      <h1 className="mb-4">Inventory Manager Web App</h1>
      <p>Inventory count: {inventory.length}</p>
      {inventory.length === 0 && <p>Loading inventory...</p>}
      {inventory.length > 0 && (
        <>
          <InventoryTable inventory={inventory} setInventory={setInventory} />
          <div className="my-3">
            <button className="btn btn-primary me-2" onClick={generateStage}>Generate Stage</button>
            <button className="btn btn-secondary me-2" onClick={exportInventory}>Export Inventory CSV</button>
            <button className="btn btn-warning" onClick={resetInventory}>Reset Inventory From CSV</button>
          </div>
        </>
      )}
      {stagedItems.length > 0 && (
        <>
          <StageView stagedItems={stagedItems} setStagedItems={setStagedItems} />
          <button className="btn btn-success mt-3" onClick={exportInvoice}>Export Invoice CSV</button>
          <InvoiceView stagedItems={stagedItems} />
        </>
      )}
    </div>
  );
}
