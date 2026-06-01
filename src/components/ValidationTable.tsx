import React from 'react';
import type { Project } from '../types';
import { calculateReceiptCalculatedTotal } from '../utils/calculations';
import { Check } from 'lucide-react';

interface ValidationTableProps {
  project: Project;
  updateProject: (p: Project) => void;
}

export const ValidationTable: React.FC<ValidationTableProps> = ({ project, updateProject }) => {
  const receiptDiffs = project.receipts.map(receipt => {
    const calculated = calculateReceiptCalculatedTotal(receipt);
    const diff = calculated - (receipt.expectedTotal || 0);
    return { receipt, calculated, diff, isMatch: Math.abs(diff) < 0.01 };
  });

  const hasErrors = receiptDiffs.some(r => !r.isMatch);

  return (
    <div className="bg-[#09090b] rounded-2xl p-5 border border-zinc-800 shadow-2xl">
      <h3 className={`text-sm font-medium uppercase tracking-wider mb-4 ${hasErrors ? 'text-red-400' : 'text-zinc-400'}`}>Validation</h3>
      <div className="rounded-xl overflow-hidden border border-zinc-800/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-zinc-900/50 text-zinc-500">
              <th className="p-3 font-medium border-b border-zinc-800">Receipt</th>
              <th className="p-3 font-medium border-b border-zinc-800 text-right">Expected</th>
              <th className="p-3 font-medium border-b border-zinc-800 text-right">Actual</th>
              {hasErrors && <th className="p-3 font-medium border-b border-zinc-800 text-right">Diff</th>}
            </tr>
          </thead>
          <tbody>
            {project.receipts.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-zinc-600 text-xs">No receipts added yet</td>
              </tr>
            ) : (
              receiptDiffs.map(({ receipt, calculated, diff, isMatch }) => (
                <tr key={receipt.id} className={`border-b border-zinc-800 last:border-0 ${isMatch ? 'bg-zinc-900/20' : 'bg-red-950/20'}`}>
                  <td className="p-3 text-zinc-300 font-medium">{receipt.name || 'Unnamed'}</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={receipt.expectedTotal || ''}
                      onChange={(e) => {
                        const newTotal = parseFloat(e.target.value) || 0;
                        updateProject({
                          ...project,
                          receipts: project.receipts.map(r => r.id === receipt.id ? { ...r, expectedTotal: newTotal } : r)
                        });
                      }}
                      className="w-20 text-right bg-transparent outline-none border-b border-dashed border-zinc-700 focus:border-zinc-500 text-zinc-100 font-mono text-sm"
                      placeholder="0.00"
                    />
                  </td>
                  <td className={`p-3 text-right font-mono ${isMatch ? 'text-green-500' : 'text-red-400'}`}>
                    {calculated.toFixed(2)}
                  </td>
                  {hasErrors && (
                    <td className={`p-3 text-right font-mono text-xs ${isMatch ? 'text-zinc-500' : 'text-red-400'}`}>
                      <div className="flex items-center justify-end gap-2">
                        <span>{isMatch ? '—' : (diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2))}</span>
                        {!isMatch && (
                          <button
                            onClick={() => {
                              updateProject({
                                ...project,
                                receipts: project.receipts.map(r => r.id === receipt.id ? { ...r, expectedTotal: calculated } : r)
                              });
                            }}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-green-400 transition-colors"
                            title="Auto-fill Expected"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-600 mt-4 text-center leading-relaxed">
        Verify that the sum matches your physical receipt exactly.
      </p>
    </div>
  );
};
