'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/store/useAppStore';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function CSVImportModal({ open, onClose }: CSVImportModalProps) {
  const { categories, addTransaction, transactions } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);

  // Column Mappings
  const [mapping, setMapping] = useState({
    date: '',
    description: '',
    amount: '',
    type: '',
    category: '',
    paymentMethod: '',
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) {
        toast.error('The selected CSV file is empty.');
        return;
      }

      // Simple CSV parser
      const parseCSVLine = (line: string) => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            result.push(cur.trim().replace(/^"|"$/g, ''));
            cur = '';
          } else cur += char;
        }
        result.push(cur.trim().replace(/^"|"$/g, ''));
        return result;
      };

      const headers = parseCSVLine(lines[0]);
      const rows = lines.slice(1).map(parseCSVLine).filter((r) => r.length >= headers.length / 2);

      setRawHeaders(headers);
      setRawRows(rows);

      // Auto-guess mapping
      const lowerHeaders = headers.map((h) => h.toLowerCase());
      setMapping({
        date: headers[lowerHeaders.findIndex((h) => h.includes('date'))] || headers[0] || '',
        description: headers[lowerHeaders.findIndex((h) => h.includes('desc') || h.includes('payee') || h.includes('name'))] || headers[1] || '',
        amount: headers[lowerHeaders.findIndex((h) => h.includes('amount') || h.includes('val'))] || headers[2] || '',
        type: headers[lowerHeaders.findIndex((h) => h.includes('type'))] || '',
        category: headers[lowerHeaders.findIndex((h) => h.includes('cat'))] || '',
        paymentMethod: headers[lowerHeaders.findIndex((h) => h.includes('method') || h.includes('pay'))] || '',
      });

      setStep(2);
    };

    reader.readAsText(file);
  }

  // Parsed rows for step 3 preview
  const parsedRecords = rawRows.map((row) => {
    const getVal = (colName: string) => {
      const idx = rawHeaders.indexOf(colName);
      return idx !== -1 && row[idx] ? row[idx] : '';
    };

    const dateVal = getVal(mapping.date) || new Date().toISOString().slice(0, 10);
    const descVal = getVal(mapping.description) || 'Imported Transaction';
    const rawAmt = parseFloat(getVal(mapping.amount).replace(/[^0-9.-]/g, '')) || 0;
    const typeVal = getVal(mapping.type).toLowerCase().includes('inc') || rawAmt > 0 ? 'income' : 'expense';
    const absAmt = Math.abs(rawAmt);

    // Duplicate check
    const isDuplicate = transactions.some((t) => t.date === dateVal && Math.abs(t.amount - absAmt) < 0.01 && t.description.toLowerCase() === descVal.toLowerCase());
    const isValidRow = absAmt > 0 && descVal.length > 0;

    return {
      date: dateVal,
      description: descVal,
      amount: absAmt,
      type: typeVal as 'income' | 'expense',
      categoryId: categories[0]?.id || 'cat-food',
      paymentMethod: 'credit_card' as const,
      account: 'Imported',
      notes: 'Imported via CSV',
      isDuplicate,
      isValidRow,
    };
  });

  const validCount = parsedRecords.filter((r) => r.isValidRow).length;
  const duplicateCount = parsedRecords.filter((r) => r.isDuplicate).length;

  function handleExecuteImport() {
    let imported = 0;
    parsedRecords.forEach((rec) => {
      if (rec.isValidRow && !rec.isDuplicate) {
        addTransaction({
          description: rec.description,
          amount: rec.amount,
          type: rec.type,
          categoryId: rec.categoryId,
          date: rec.date,
          paymentMethod: rec.paymentMethod,
          account: rec.account,
          notes: rec.notes,
          isRecurring: false,
        });
        imported++;
      }
    });

    toast.success(`Successfully imported ${imported} transactions!`);
    handleClose();
  }

  function handleClose() {
    setStep(1);
    setFileName('');
    setRawHeaders([]);
    setRawRows([]);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import Transactions CSV">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: step === 1 ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>1. Upload File</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: step === 2 ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>2. Map Columns</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: step === 3 ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>3. Validate & Import</div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div style={{
            border: '2px dashed var(--border-default)', borderRadius: 'var(--radius-lg)',
            padding: 36, textAlign: 'center', background: 'var(--bg-secondary)',
          }}>
            <Upload size={36} color="var(--accent-primary)" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>Select a CSV File</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Import transactions exported from your bank</div>
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
              Browse File
              <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
        )}

        {/* Step 2: Mapping */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Selected File: <strong>{fileName}</strong> ({rawRows.length} rows found)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Date Column</label>
                <select className="form-control" value={mapping.date} onChange={(e) => setMapping((m) => ({ ...m, date: e.target.value }))}>
                  {rawHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description Column</label>
                <select className="form-control" value={mapping.description} onChange={(e) => setMapping((m) => ({ ...m, description: e.target.value }))}>
                  {rawHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount Column</label>
                <select className="form-control" value={mapping.amount} onChange={(e) => setMapping((m) => ({ ...m, amount: e.target.value }))}>
                  {rawHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Type Column (Optional)</label>
                <select className="form-control" value={mapping.type} onChange={(e) => setMapping((m) => ({ ...m, type: e.target.value }))}>
                  <option value="">Auto-detect from amount</option>
                  {rawHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}><ArrowLeft size={14} /> Back</button>
              <button className="btn btn-primary btn-sm" onClick={() => setStep(3)}>Preview & Validate <ArrowRight size={14} /></button>
            </div>
          </div>
        )}

        {/* Step 3: Validation & Preview */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, padding: 12, background: 'var(--green-muted)', color: 'var(--green)', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} /> {validCount} Valid Rows
              </div>
              {duplicateCount > 0 && (
                <div style={{ flex: 1, padding: 12, background: 'var(--yellow-muted)', color: 'var(--yellow)', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} /> {duplicateCount} Duplicates Skipped
                </div>
              )}
            </div>

            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRecords.slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.description}</td>
                      <td>${r.amount.toFixed(2)}</td>
                      <td>
                        {r.isDuplicate ? (
                          <span className="badge badge-warning">Duplicate</span>
                        ) : r.isValidRow ? (
                          <span className="badge badge-income">Valid</span>
                        ) : (
                          <span className="badge badge-expense">Invalid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep(2)}><ArrowLeft size={14} /> Back</button>
              <button className="btn btn-primary btn-sm" onClick={handleExecuteImport}>
                Import {validCount - duplicateCount} Records
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
