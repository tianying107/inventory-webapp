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
      console.log('Raw CSV fetched (first 200 chars):', text.slice(0, 200));
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
      });
      if (result.errors.length) {
        console.error('CSV parse errors:', result.errors);
      }
      console.log('Parsed rows count:', result.data.length);
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
    .catch(error => {
      console.error('Failed to load or parse CSV:', error);
      return [];
    });
}

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [stagedItems, setStagedItems] = useState([]);

  // Determine base path for fetching resources (GitHub Pages support)
  const basePath = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : '';

  useEffect(() => {
    const storedInventory = localStorage.getItem(STORAGE_KEY);
    if (storedInventory) {
      console.log('Loaded inventory from localStorage');
      setInventory(JSON.parse(storedInventory));
    } else {
      console.log('Fetching inventory CSV');
      fetchCSV(`${basePath}/Inventory.csv`)
        .then(data => {
          console.log('Fetched inventory data:', data);
          setInventory(data);
        })
        .catch(() => {
          setInventory([]);
        });
    }
  }, [basePath]);

  useEffect(() => {
    console.log('Inventory state updated:', inventory);
    if (inventory.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    }
  }, [inventory]);

  function generateStage() {
    const selectedItems = inventory.filter(item => item.selected);
    const copy = selectedItems.map(item => ({ ...item, askCount: 0 }));
    setStagedItems(copy);
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
    fetchCSV(`${basePath}/Inventory.csv`).then(data => setInventory(data));
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Inventory Manager Web App</h1>
      <p>Inventory count: {inventory.length}</p>
      {inventory.length === 0 && <p>Loading inventory...</p>}
      {inventory.length > 0 && (
        <>
          <InventoryTable inventory={inventory} setInventory={setInventory} />
          <div style={{ marginTop: 10 }}>
            <button onClick={generateStage}>Generate Stage</button>
            <button onClick={exportInventory} style={{ marginLeft: 10 }}>Export Inventory CSV</button>
            <button onClick={resetInventory} style={{ marginLeft: 10 }}>Reset Inventory From CSV</button>
          </div>
        </>
      )}
      {stagedItems.length > 0 && (
        <>
          <StageView stagedItems={stagedItems} setStagedItems={setStagedItems} />
          <button onClick={exportInvoice} style={{ marginTop: 10 }}>Export Invoice CSV</button>
          <InvoiceView stagedItems={stagedItems} />
        </>
      )}
    </div>
  );
}
