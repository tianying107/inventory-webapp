import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import Papa from 'papaparse';
import InventoryTable from './InventoryTable';
import StageView from './StageView';
import InvoiceView from './InvoiceView';
import { arrayToCsv } from './utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const basePath = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL : '';
const APPVERSION = '1.0.3';

// Load CSV every refresh ignoring localStorage
function fetchCSV(url) {
  return fetch(url)
    .then(res => res.text())
    .then(text => {
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
      });
      return result.data.map(row => ({
        section: row.Section,
        product: row.Product,
        unitPrice: row['Unit Price'] ? String(row['Unit Price']).replace(/[^0-9.]/g, '') : '',
        count: parseInt(row.Count, 10) || 0,
        description: row.Description ?? '',
        selected: false,
        askCount: 0,
      }));
    })
    .catch(err => {
      console.error('Failed to fetch CSV:', err);
      return [];
    });
}

function loadStagedItemsFromLocalStorage() {
  try {
    const saved = localStorage.getItem('myapp_stagedItems');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load staged items from localStorage', e);
  }
  return [];
}

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [stagedItems, setStagedItems] = useState(loadStagedItemsFromLocalStorage());
  const [discount, setDiscount] = useState(10);
  const [activeTab, setActiveTab] = useState('inventory');

  // Always load inventory from CSV after every refresh again
  useEffect(() => {
    fetchCSV(basePath + '/Inventory.csv').then(data => setInventory(data));
  }, []);

  // Persist stagedItems to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("myapp_stagedItems", JSON.stringify(stagedItems));
      let history = [];
      const historyJson = localStorage.getItem('myapp_stagedItems_HISTORY');
      if (historyJson) history = JSON.parse(historyJson);
      if (
        !history.length ||
        JSON.stringify(history[history.length - 1]) !== JSON.stringify(stagedItems)
      ) {
        history.push(stagedItems);
        if (history.length > 10) history.shift();
        localStorage.setItem('myapp_stagedItems_HISTORY', JSON.stringify(history));
        console.log('Stage history updated:', history); // Debugging: check browser console for this!
      }
    } catch (e) {
      console.error('Stage history error:', e);
    }
  }, [stagedItems]);
   

  function restoreLastStageAndInventory() {
    const savedJson = localStorage.getItem("myapp_stagedItems");
    if (!savedJson) {
      alert("No saved stage data found.");
      return;
    }
    try {
      const savedItems = JSON.parse(savedJson);
      if (Array.isArray(savedItems) && savedItems.length > 0) {
        setStagedItems(savedItems);
        setInventory((prevInventory) =>
          prevInventory.map((invItem) => {
            const matched = savedItems.find(
              (staged) =>
                staged.product === invItem.product &&
                staged.section === invItem.section
            );
            return {
              ...invItem,
              selected: Boolean(matched),
            };
          })
        );
        setActiveTab("stage");
      } else {
        alert("No valid saved stage data found.");
      }
    } catch (error) {
      console.error("Restore parse error:", error);
      alert("Failed to restore last stage data.");
    }
  }

  function restorePriorAskCountOnly() {
    const historyJson = localStorage.getItem('myapp_stagedItems_HISTORY');
    if (!historyJson) {
      alert('No stage history found.');
      return;
    }
    try {
      let history = JSON.parse(historyJson);
      if (!Array.isArray(history) || history.length < 2) {
        alert('No prior stage found.');
        return;
      }
      // Remove current, get prior stage
      history.pop();
      const priorStage = history[history.length - 1] || [];
  
      setStagedItems(prev => prev.map(item => {
        const prior = priorStage.find(
          old =>
            old.product === item.product &&
            old.section === item.section
        );
        // Only override askCount if there was a match in prior, else keep current
        return prior
          ? { ...item, askCount: prior.askCount }
          : { ...item };
      }));
  
      // Optionally update inventory askCount too if it matters:
      setInventory(prevInventory => prevInventory.map(invItem => {
        const prior = priorStage.find(
          old =>
            old.product === invItem.product &&
            old.section === invItem.section
        );
        return {
          ...invItem,
          askCount: prior ? prior.askCount : (invItem.askCount || 0),
        };
      }));
  
      setActiveTab('stage');
    } catch (error) {
      console.error('Restore prior askCount error:', error);
      alert('Failed to restore prior askCount.');
    }
  }
   

  function generateStage() {
    const selected = inventory.filter(item => item.selected);
    const newStage = selected.map(item => ({ ...item, askCount: 0 }));
    setStagedItems(newStage);
    setActiveTab('stage');
  }

  function resetSelected() {
    const newInv = inventory.map(item => ({ ...item, selected: false }));
    setInventory(newInv);
  }

  function resetInventory() {
    fetchCSV(basePath + '/Inventory.csv').then(data => setInventory(data));
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

  function exportInvoice() {
    const filtered = stagedItems.filter(item => item.askCount > 0);
    const invoiceData = filtered.map(item => ({
      Section: item.section,
      Product: item.product,
      Description: item.description,
      Price: item.unitPrice,
      Quantity: item.askCount,
      Subtotal: (item.askCount * parseFloat(item.unitPrice || '0')).toFixed(2),
    }));
    const csv = arrayToCsv(invoiceData);
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

  return (
    <div className="container my-4">
      <div
        className="mb-3 text-muted"
        style={{ fontSize: '0.9rem', fontWeight: 'bold' }}
      >
        App Version v{APPVERSION}
      </div>

      <h1 className="mb-4">Inventory Manager Web App</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => k && setActiveTab(k)}
        className="mb-3 tab-container"
        variant="pills"
        fill
        justify
        mountOnEnter
        unmountOnExit
      >
        <Tab eventKey="inventory" title="Inventory">
          <div className="my-3 d-flex flex-wrap gap-2 justify-content-start">
            <button className="btn btn-primary" onClick={generateStage}>
              Generate Stage
            </button>
            <button className="btn btn-secondary" onClick={exportInventory}>
              Export Inventory CSV
            </button>
            <button className="btn btn-warning" onClick={resetInventory}>
              Reset Inventory From CSV
            </button>
            <button className="btn btn-info" onClick={resetSelected}>
              Reset Selected Items
            </button>
          </div>
          <InventoryTable inventory={inventory} setInventory={setInventory} />
        </Tab>

        <Tab eventKey="stage" title="Stage">
          <div className="my-3">
            <label htmlFor="discountInput" className="form-label">
              Discount
            </label>
            <input
              id="discountInput"
              type="number"
              className="form-control form-control-sm"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              style={{ maxWidth: '140px' }}
              inputMode="decimal"
            />
          </div>
          <StageView
              stagedItems={stagedItems}
              setStagedItems={setStagedItems}
              restoreLastStageAndInventory={restoreLastStageAndInventory}
              restorePriorAskCountOnly={restorePriorAskCountOnly}
          />

        </Tab>

        <Tab eventKey="invoice" title="Invoice">
          <button className="btn btn-success mb-3" onClick={exportInvoice}>
            Export Invoice CSV
          </button>
          <InvoiceView stagedItems={stagedItems} discount={discount} />
        </Tab>
      </Tabs>
    </div>
  );
}
