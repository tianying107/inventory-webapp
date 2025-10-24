import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'myapp_stagedItems';

export default function StageView({
  stagedItems,
  setStagedItems,
  restoreLastStageAndInventory,
  restorePriorAskCountOnly,
}) {
  const [showAsk, setShowAsk] = useState(true);
  const [editing, setEditing] = useState({ idx: null, field: null, value: '' });
  const chunkSize = 15;

  const totalItemCount = stagedItems.length;
  const chunks = [];
  for (let i = 0; i < stagedItems.length; i += chunkSize) {
    chunks.push(stagedItems.slice(i, i + chunkSize));
  }

  // Start editing a cell
  function beginEdit(idx, field, value) {
    setEditing({ idx, field, value });
  }

  function handleEditChange(e) {
    setEditing(cur => ({ ...cur, value: e.target.value }));
  }

  function handleEditCommit() {
    if (editing.idx == null || !editing.field) return;
    const newItems = [...stagedItems];
    let val = editing.value;
    if (editing.field === 'unitPrice' && val !== '') {
      val = Number(val).toFixed(2);
    }
    newItems[editing.idx] = { ...newItems[editing.idx], [editing.field]: val };
    setStagedItems(newItems);
    setEditing({ idx: null, field: null, value: '' });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleEditCommit();
    if (e.key === 'Escape') setEditing({ idx: null, field: null, value: '' });
  }

  function handleBlur() {
    handleEditCommit();
  }

  function handleAskChange(globalIdx, value) {
    const newItems = [...stagedItems];
    newItems[globalIdx].askCount = Number(value) || 0;
    setStagedItems(newItems);
  }

  function handleAskFocus(e) {
    if (e.target.value === '0') e.target.value = '';
  }

  function restoreLastStage() {
    try {
      const savedJson = localStorage.getItem(STORAGE_KEY);
      if (!savedJson) {
        alert('No saved stage data found in localStorage.');
        return;
      }
      const savedItems = JSON.parse(savedJson);
      if (Array.isArray(savedItems) && savedItems.length > 0) {
        setStagedItems(savedItems);
      } else {
        alert('No valid saved stage data found.');
      }
    } catch {
      alert('Failed to restore last stage data.');
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stagedItems));
    } catch {
      // ignore storage errors
    }
  }, [stagedItems]);

  return (
    <div className="table-responsive">
      <div className="mb-2 fw-bold">Total items: {totalItemCount}</div>
      <button
        className="btn btn-secondary mb-3"
        onClick={restoreLastStageAndInventory}
      >
        Restore Last Stage
      </button>
      <button
        className="btn btn-warning mb-3 ms-2"
        onClick={restorePriorAskCountOnly}
      >
        Restore Prior Stage
      </button>
      <button
        className="btn btn-outline-dark mb-3 ms-2"
        onClick={() => setShowAsk(v => !v)}
      >
        {showAsk ? 'Hide Ask Column' : 'Show Ask Column'}
      </button>

      {chunks.map((chunk, pageIdx) => (
        <div key={pageIdx} style={{ marginBottom: 24 }}>
          <table
            className="table table-bordered table-striped text-center align-middle"
            style={{
              width: '100%',
              fontWeight: 700,
              borderCollapse: 'collapse',
              tableLayout: 'auto',
              background: '#fff',
            }}
          >
            <thead>
              <tr style={{ background: '#bababa' }}>
                <th style={{ width: showAsk ? '34%' : '44%' }}>Product</th>
                <th style={{ width: '18%' }}>Price</th>
                <th style={{ width: '18%' }}>Qty</th>
                {showAsk && <th style={{ width: '18%' }}>Ask</th>}
              </tr>
            </thead>
            <tbody>
              {chunk.map((item, idx) => {
                const globalIdx = pageIdx * chunkSize + idx;
                return (
                  <tr key={idx}>
                    {/* Product name editable on click */}
                    <td
                      style={{
                        fontWeight: 700,
                        textAlign: 'left',
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        fontSize: '1.08rem',
                        cursor: 'pointer',
                      }}
                      title={item.product}
                      onClick={() =>
                        beginEdit(globalIdx, 'product', item.product)
                      }
                    >
                      {editing.idx === globalIdx && editing.field === 'product' ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          autoFocus
                          value={editing.value}
                          onChange={handleEditChange}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          style={{
                            fontWeight: 700,
                            border: '2px solid #000',
                            boxShadow: 'none',
                          }}
                        />
                      ) : (
                        item.product
                      )}
                    </td>

                    {/* Price editable on click */}
                    <td
                      style={{
                        fontWeight: 700,
                        cursor: 'pointer',
                        verticalAlign: 'middle',
                      }}
                      onClick={() =>
                        beginEdit(globalIdx, 'unitPrice', item.unitPrice)
                      }
                    >
                      {editing.idx === globalIdx && editing.field === 'unitPrice' ? (
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          className="form-control form-control-sm text-center"
                          autoFocus
                          value={editing.value}
                          onChange={handleEditChange}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          style={{
                            fontWeight: 700,
                            border: '2px solid #000',
                            boxShadow: 'none',
                          }}
                        />
                      ) : (
                        item.unitPrice
                      )}
                    </td>

                    {/* Qty */}
                    <td style={{ fontWeight: 700 }}>{item.count || ''}</td>

                    {/* Ask */}
                    {showAsk && (
                      <td style={{ fontWeight: 700 }}>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="off"
                          className="form-control form-control-sm text-center"
                          style={{
                            maxWidth: 54,
                            fontWeight: 700,
                            border: '2px solid #000',
                            boxShadow: 'none',
                          }}
                          min="0"
                          value={item.askCount || ''}
                          onChange={e =>
                            handleAskChange(globalIdx, e.target.value)
                          }
                          onFocus={handleAskFocus}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
