import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, FileJson, FileSpreadsheet, Download } from 'lucide-react';
import { SectionHeader } from '../components/ui';
import { useWellContext } from '../hooks/useWellContext';
import type { DrillingEvent } from '../types';

export function DataImportPage() {
  const { addImportedRecords, importedRecords } = useWellContext();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validRecords, setValidRecords] = useState<DrillingEvent[]>([]);
  const [invalidCount, setInvalidCount] = useState(0);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setValidRecords([]);
      setInvalidCount(0);
      setError(null);
      setImportSuccess(false);
    }
  };

  const validateRow = (row: any): row is DrillingEvent => {
    if (!row.id || typeof row.id !== 'string') return false;
    if (!['Mud Loss', 'Stuck Pipe', 'Kick', 'Torque Spike', 'Cementing Issue', 'Fishing', 'NPT'].includes(row.eventType)) return false;
    if (typeof row.depth !== 'number' || isNaN(row.depth)) return false;
    if (!['F1', 'F2', 'F3', 'F4', 'F5'].includes(row.formation)) return false;
    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(row.severity)) return false;
    if (!row.description || typeof row.description !== 'string') return false;
    if (!row.mitigation || typeof row.mitigation !== 'string') return false;
    if (!row.sourceDocument || typeof row.sourceDocument !== 'string') return false;
    if (!row.timestamp || isNaN(Date.parse(row.timestamp))) return false;
    return true;
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");
    const headers = lines[0].split(',');
    
    const parsed: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      // Basic CSV split that ignores commas inside double quotes
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const row: any = {};
      headers.forEach((header, index) => {
        let val = values[index] ? values[index].trim() : '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        if (header === 'depth' || header === 'durationHours') {
          row[header] = val ? Number(val) : undefined;
        } else {
          row[header] = val;
        }
      });
      parsed.push(row);
    }
    return parsed;
  };

  const handleParse = () => {
    if (!file) return;
    setParsing(true);
    setError(null);
    setValidRecords([]);
    setInvalidCount(0);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let data: any[] = [];
        
        if (file.name.toLowerCase().endsWith('.json')) {
          data = JSON.parse(text);
          if (!Array.isArray(data)) throw new Error("JSON file must contain an array of records.");
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          data = parseCSV(text);
        } else {
          throw new Error("Unsupported file type. Please upload a .csv or .json file.");
        }

        const valid: DrillingEvent[] = [];
        let invalid = 0;

        data.forEach(row => {
          // Normalize some types just in case
          if (typeof row.depth === 'string') row.depth = Number(row.depth);
          if (typeof row.durationHours === 'string') row.durationHours = Number(row.durationHours);
          
          if (validateRow(row)) {
            // Append a suffix so we know it's imported
            valid.push({ ...row, id: row.id.endsWith('-IMP') ? row.id : `${row.id}-IMP` });
          } else {
            invalid++;
          }
        });

        setValidRecords(valid);
        setInvalidCount(invalid);
      } catch (err: any) {
        setError(err.message || "Failed to parse file.");
      } finally {
        setParsing(false);
      }
    };
    
    reader.onerror = () => {
      setError("Failed to read file.");
      setParsing(false);
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    if (validRecords.length > 0) {
      addImportedRecords(validRecords);
      setImportSuccess(true);
    }
  };

  const downloadTemplate = (type: 'csv' | 'json') => {
    const templateData = [
      {
        id: "EV-UPLOAD-01",
        eventType: "Torque Spike",
        depth: 3500,
        formation: "F4",
        severity: "MEDIUM",
        description: "Unexpected torque spike during drilling.",
        mitigation: "Reduced WOB and circulated.",
        sourceDocument: "DOC-2023-01",
        timestamp: "2023-01-15T08:00:00Z",
        durationHours: 2
      }
    ];

    let content = '';
    let mime = '';
    if (type === 'json') {
      content = JSON.stringify(templateData, null, 2);
      mime = 'application/json';
    } else {
      content = 'id,eventType,depth,formation,severity,description,mitigation,sourceDocument,timestamp,durationHours\n' +
                '"EV-UPLOAD-01","Torque Spike",3500,"F4","MEDIUM","Unexpected torque spike during drilling.","Reduced WOB and circulated.","DOC-2023-01","2023-01-15T08:00:00Z",2';
      mime = 'text/csv';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nwis_template.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <SectionHeader 
        title="Data Import" 
        subtitle="Import historical well records (CSV or JSON) into prototype session storage." 
        icon={Upload} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Instructions and Templates */}
        <div className="space-y-6">
          <div className="bg-surface-card border border-border-default rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Import Guidelines</h3>
            <ul className="text-sm text-slate-300 space-y-3">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <span>Only structured <strong>.csv</strong> and <strong>.json</strong> files are supported in this MVP.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span><strong>PDF extraction is not supported.</strong> Unstructured PDF documents cannot be automatically converted into drilling events at this phase.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span>Records are saved to browser session storage. They will be cleared if you close the tab.</span>
              </li>
            </ul>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-3">Download Templates</h4>
            <div className="flex gap-3">
              <button onClick={() => downloadTemplate('csv')} className="flex-1 flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 border border-border-subtle rounded py-2 text-xs text-slate-300 transition-colors">
                <FileSpreadsheet size={14} /> CSV Template
              </button>
              <button onClick={() => downloadTemplate('json')} className="flex-1 flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 border border-border-subtle rounded py-2 text-xs text-slate-300 transition-colors">
                <FileJson size={14} /> JSON Template
              </button>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
             <div className="text-sm text-blue-300 font-semibold mb-2">Total Imported Records</div>
             <div className="text-3xl font-bold text-white">{importedRecords.length}</div>
          </div>
        </div>

        {/* Right Column: Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card border border-border-default rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Upload size={16} className="text-accent-400" /> Upload File
            </h3>

            <div 
              className="border-2 border-dashed border-border-subtle hover:border-accent-500/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center bg-navy-900/50 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText size={32} className="text-slate-500 mb-3" />
              <p className="text-sm text-white font-medium mb-1">Click to select a file</p>
              <p className="text-xs text-slate-500">Supports .csv and .json</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv,.json,application/json,text/csv" 
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <div className="mt-4 p-3 bg-navy-800 border border-border-subtle rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-accent-400" />
                  <div>
                    <p className="text-sm text-white font-medium">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={handleParse}
                  disabled={parsing}
                  className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                >
                  {parsing ? 'Parsing...' : 'Analyze File'}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {(validRecords.length > 0 || invalidCount > 0) && !importSuccess && (
            <div className="bg-surface-card border border-border-default rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Preview & Import</h3>
              
              <div className="flex gap-4 mb-4">
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded p-3 text-center">
                  <p className="text-xs text-emerald-400/80 uppercase tracking-wider mb-1">Valid Records</p>
                  <p className="text-2xl font-bold text-emerald-400">{validRecords.length}</p>
                </div>
                <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded p-3 text-center">
                  <p className="text-xs text-red-400/80 uppercase tracking-wider mb-1">Invalid Rows</p>
                  <p className="text-2xl font-bold text-red-400">{invalidCount}</p>
                </div>
              </div>

              {invalidCount > 0 && (
                <p className="text-xs text-amber-400 mb-4 bg-amber-500/10 p-2 rounded">
                  Invalid rows are missing required fields or have incorrect data types. They will be skipped.
                </p>
              )}

              {validRecords.length > 0 && (
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto bg-navy-900 border border-border-subtle rounded text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-navy-950 sticky top-0">
                        <tr>
                          <th className="p-2 border-b border-border-subtle text-slate-400">ID</th>
                          <th className="p-2 border-b border-border-subtle text-slate-400">Event</th>
                          <th className="p-2 border-b border-border-subtle text-slate-400">Depth</th>
                          <th className="p-2 border-b border-border-subtle text-slate-400">Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validRecords.slice(0, 10).map((r, i) => (
                          <tr key={i} className="border-b border-border-subtle last:border-0 hover:bg-navy-800">
                            <td className="p-2 text-slate-300 font-mono">{r.id}</td>
                            <td className="p-2 text-slate-300">{r.eventType}</td>
                            <td className="p-2 text-slate-300">{r.depth}m</td>
                            <td className="p-2 text-slate-300">{r.severity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validRecords.length > 10 && (
                      <div className="p-2 text-center text-slate-500 border-t border-border-subtle italic">
                        Showing first 10 valid records...
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleImport}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} /> Import {validRecords.length} Records
                  </button>
                </div>
              )}
            </div>
          )}

          {importSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-8 text-center flex flex-col items-center">
              <CheckCircle size={48} className="text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Import Successful</h3>
              <p className="text-sm text-emerald-200/80 mb-6">
                {validRecords.length} historical records have been added to your prototype session. They are now available in Knowledge Search.
              </p>
              <button 
                onClick={() => {
                  setFile(null);
                  setImportSuccess(false);
                  setValidRecords([]);
                  setInvalidCount(0);
                }}
                className="px-6 py-2 bg-navy-800 hover:bg-navy-700 text-white border border-border-subtle rounded transition-colors"
              >
                Import More Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
