import React from 'react';
import type { Project } from '../types';
import { calculateReceiptTotals, calculateGrandTotals } from '../utils/calculations';

interface ExportViewProps {
  project: Project;
  exportRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportView: React.FC<ExportViewProps> = ({ project, exportRef }) => {
  const allTags = Array.from(new Set([
    ...project.friends.map(f => f.name),
    ...(project.tags || []),
  ]));
  const grandTotals = calculateGrandTotals(project.receipts, project.friends);

  return (
    // opacity:0 + pointerEvents:none keeps the element in the render tree
    // (so html-to-image can measure and capture it) without it being visible
    // or interactive. left:-9999px skips rendering in some browsers — avoid it.
    <div
      aria-hidden="true"
      style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
    >
    <div
      ref={exportRef}
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        color: '#e4e4e7',
        background: '#09090b',
        padding: '28px',
        width: '520px',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand */}
      <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#52525b', marginBottom: '20px', fontWeight: 600 }}>
        bill-splitter
        <span style={{ fontStyle: 'italic', letterSpacing: '0.5px', color: '#3f3f46', fontWeight: 400, textTransform: 'none', marginLeft: '8px' }}>· by hzrq</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '-0.5px', color: '#f4f4f5' }}>
          {project.name}
        </div>
        <div style={{ fontSize: '12px', color: '#71717a', marginTop: '3px' }}>
          {new Date(project.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
        {allTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            {allTags.map((tag, i) => (
              <span key={i} style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', background: '#27272a', color: '#a1a1aa', padding: '3px 8px', borderRadius: '4px' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#18181b' }}>
            <th style={{ padding: '6px 12px', textAlign: 'left', color: '#a1a1aa', fontWeight: 500, borderBottom: '1px solid #3f3f46', minWidth: '160px' }}>
              Item
            </th>
            {project.friends.map(f => (
              <th key={f.id} style={{ padding: '6px 12px', textAlign: 'center', color: '#e4e4e7', fontWeight: 500, borderBottom: '1px solid #3f3f46', minWidth: '100px', borderLeft: '1px solid #27272a' }}>
                {f.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {project.receipts.map(receipt => {
            const { totals, taxAmounts } = calculateReceiptTotals(receipt, project.friends);
            const hasTax = receipt.taxPercentage > 0;
            return (
              <React.Fragment key={receipt.id}>
                {/* Receipt label */}
                <tr style={{ background: '#18181b' }}>
                  <td colSpan={project.friends.length + 1} style={{ padding: '5px 12px', color: '#71717a', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #3f3f46' }}>
                    {receipt.name || 'Unnamed'}
                  </td>
                </tr>
                {/* Items */}
                {receipt.items.map(item => {
                  const hasValue = project.friends.some(f => (item.splits[f.id] || 0) > 0);
                  if (!hasValue && !item.name) return null;
                  return (
                    <tr key={item.id} style={{ background: '#09090b', borderBottom: '1px solid #27272a' }}>
                      <td style={{ padding: '4px 12px 4px 20px', color: '#d4d4d8' }}>
                        {item.name || '—'}
                      </td>
                      {project.friends.map(f => (
                        <td key={f.id} style={{ padding: '4px 12px', textAlign: 'center', color: '#a1a1aa', fontFamily: 'monospace', borderLeft: '1px solid #27272a' }}>
                          {item.splits[f.id] ? item.splits[f.id].toFixed(2) : '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {/* Tax */}
                {hasTax && (
                  <tr style={{ background: '#111113', borderBottom: '1px solid #27272a' }}>
                    <td style={{ padding: '3px 12px 3px 20px', color: '#52525b', fontSize: '11px' }}>
                      Tax ({receipt.taxPercentage}%)
                    </td>
                    {project.friends.map(f => (
                      <td key={f.id} style={{ padding: '3px 12px', textAlign: 'center', color: '#52525b', fontFamily: 'monospace', fontSize: '11px', borderLeft: '1px solid #27272a' }}>
                        {taxAmounts[f.id] > 0 ? taxAmounts[f.id].toFixed(2) : '—'}
                      </td>
                    ))}
                  </tr>
                )}
                {/* Receipt total */}
                <tr style={{ background: '#18181b', borderBottom: '3px solid #27272a' }}>
                  <td style={{ padding: '3px 12px', color: '#71717a', fontWeight: 400, fontSize: '11px', fontStyle: 'italic' }}>Sub Total</td>
                  {project.friends.map(f => (
                    <td key={f.id} style={{ padding: '3px 12px', textAlign: 'center', color: '#71717a', fontFamily: 'monospace', fontWeight: 400, fontSize: '11px', borderLeft: '1px solid #27272a' }}>
                      {totals[f.id] > 0 ? totals[f.id].toFixed(2) : '—'}
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#27272a' }}>
            <td style={{ padding: '9px 12px', color: '#f4f4f5', fontWeight: 600, fontSize: '14px' }}>Total</td>
            {project.friends.map(f => (
              <td key={f.id} style={{ padding: '9px 12px', textAlign: 'center', color: '#f4f4f5', fontFamily: 'monospace', fontWeight: 700, fontSize: '15px', borderLeft: '1px solid #3f3f46' }}>
                {grandTotals[f.id] > 0 ? grandTotals[f.id].toFixed(2) : '—'}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>

    </div>
    </div>
  );
};
