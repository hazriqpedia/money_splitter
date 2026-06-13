import React, { useState, useEffect, useRef } from 'react';
import type { Project, Receipt, Item } from '../types';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { calculateReceiptTotals, calculateGrandTotals } from '../utils/calculations';

interface BreakdownTableProps {
  project: Project;
  updateProject: (p: Project) => void;
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({ project, updateProject }) => {
  const [newTag, setNewTag] = useState('');
  const [collapsedReceipts, setCollapsedReceipts] = useState<Set<string>>(new Set());
  const pendingFocusId = useRef<string | null>(null);

  // Runs after every render; only does work when addItem queued a focus target.
  useEffect(() => {
    if (!pendingFocusId.current) return;
    const id = pendingFocusId.current;
    pendingFocusId.current = null;
    const el = document.querySelector<HTMLInputElement>(`[data-focus-id="${id}"]`);
    if (el) { el.focus(); el.select(); }
  });

  const toggleCollapse = (id: string) => {
    setCollapsedReceipts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      const tags = project.tags || [];
      if (!tags.includes(newTag.trim())) {
        updateProject({ ...project, tags: [...tags, newTag.trim()] });
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateProject({ ...project, tags: (project.tags || []).filter(t => t !== tag) });
  };

  const addFriend = () => {
    const newFriend = { id: uuidv4(), name: `Friend ${project.friends.length + 1}` };
    updateProject({ ...project, friends: [...project.friends, newFriend] });
    pendingFocusId.current = newFriend.id;
  };

  const removeFriend = (id: string) => {
    updateProject({
      ...project,
      friends: project.friends.filter(f => f.id !== id),
      receipts: project.receipts.map(r => ({
        ...r,
        items: r.items.map(i => {
          const newSplits = { ...i.splits };
          delete newSplits[id];
          return { ...i, splits: newSplits };
        })
      }))
    });
  };

  const updateFriendName = (id: string, name: string) => {
    updateProject({
      ...project,
      friends: project.friends.map(f => f.id === id ? { ...f, name } : f)
    });
  };

  const addReceipt = () => {
    const newReceipt: Receipt = {
      id: uuidv4(),
      name: `New Receipt`,
      expectedTotal: 0,
      taxPercentage: 0,
      items: [{ id: uuidv4(), name: 'Item 1', splits: {} }]
    };
    updateProject({ ...project, receipts: [...project.receipts, newReceipt] });
    pendingFocusId.current = newReceipt.id;
  };

  const removeReceipt = (id: string) => {
    updateProject({ ...project, receipts: project.receipts.filter(r => r.id !== id) });
  };

  const updateReceipt = (updatedReceipt: Receipt) => {
    updateProject({
      ...project,
      receipts: project.receipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r)
    });
  };

  const addItem = (receiptId: string, withFocus = false) => {
    const receipt = project.receipts.find(r => r.id === receiptId);
    if (!receipt) return;
    const newId = uuidv4();
    const newItem: Item = { id: newId, name: '', splits: {} };
    updateReceipt({ ...receipt, items: [...receipt.items, newItem] });
    if (withFocus) pendingFocusId.current = newId;
  };

  const removeItem = (receiptId: string, itemId: string) => {
    const receipt = project.receipts.find(r => r.id === receiptId);
    if (!receipt) return;
    updateReceipt({ ...receipt, items: receipt.items.filter(i => i.id !== itemId) });
  };

  const updateItemSplit = (receiptId: string, itemId: string, friendId: string, amount: string) => {
    const receipt = project.receipts.find(r => r.id === receiptId);
    if (!receipt) return;
    const items = receipt.items.map(i => {
      if (i.id !== itemId) return i;
      const numAmount = parseFloat(amount) || 0;
      const newSplits = { ...i.splits };
      if (amount === '') delete newSplits[friendId];
      else newSplits[friendId] = numAmount;
      return { ...i, splits: newSplits };
    });
    updateReceipt({ ...receipt, items });
  };

  const updateItemName = (receiptId: string, itemId: string, name: string) => {
    const receipt = project.receipts.find(r => r.id === receiptId);
    if (!receipt) return;
    updateReceipt({ ...receipt, items: receipt.items.map(i => i.id === itemId ? { ...i, name } : i) });
  };

  const grandTotals = calculateGrandTotals(project.receipts, project.friends);
  const allTags = Array.from(new Set([...project.friends.map(f => f.name), ...(project.tags || [])]));
  const hasReceipts = project.receipts.length > 0;

  return (
    <div className="w-full">
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-zinc-100">{project.name}</h2>
            <div className="text-zinc-500 text-sm mt-1">{new Date(project.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {allTags.map((tag, i) => {
            const isManual = project.tags?.includes(tag);
            return (
              <span key={i} className="text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-2 py-1 rounded flex items-center gap-1 group">
                {tag}
                {isManual && (
                  <button onClick={() => handleRemoveTag(tag)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity">
                    <Trash2 size={10} />
                  </button>
                )}
              </span>
            );
          })}
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="+ tag (press Enter)"
            className="text-[10px] uppercase tracking-wider bg-transparent border border-zinc-800 border-dashed text-zinc-400 px-2 py-1 rounded outline-none focus:border-zinc-500 focus:text-zinc-200 placeholder:normal-case w-32"
          />
        </div>
      </div>

      {/* Table scrolls on both axes; sticky thead and sticky left-0 cells work within this container */}
      <div className="overflow-auto max-h-[60vh]">
        <table className="text-left border-collapse min-w-max w-max">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="px-3 py-2 bg-zinc-900 text-zinc-500 font-medium rounded-tl-xl w-[240px] border-b border-zinc-800 sticky left-0 z-30 text-xs uppercase tracking-wider">
                Item
              </th>
              {project.friends.map((f) => (
                <th key={f.id} className="px-3 py-2 bg-zinc-900 text-zinc-200 font-medium min-w-[80px] relative group border-b border-zinc-800 border-l border-zinc-700">
                  <input
                    type="text"
                    value={f.name}
                    onChange={(e) => updateFriendName(f.id, e.target.value)}
                    data-focus-id={f.id}
                    className="bg-transparent outline-none w-full text-center placeholder-zinc-600 focus:text-white"
                    placeholder="Name"
                  />
                  {project.friends.length > 1 && (
                    <button
                      onClick={() => removeFriend(f.id)}
                      className="absolute top-1/2 -translate-y-1/2 right-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </th>
              ))}
              <th className="px-3 py-2 bg-zinc-900 text-zinc-400 font-medium rounded-tr-xl w-12 border-b border-zinc-800 border-l border-zinc-700">
                <button onClick={addFriend} className="hover:text-zinc-200 transition-colors w-full flex justify-center">
                  <Plus size={18} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {!hasReceipts ? (
              <tr>
                <td colSpan={project.friends.length + 2} className="py-16 text-center">
                  <p className="text-zinc-500 text-sm mb-3">No receipts yet</p>
                  <button
                    onClick={addReceipt}
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg px-4 py-2 transition-colors"
                  >
                    <Plus size={16} /> Add your first receipt
                  </button>
                </td>
              </tr>
            ) : (
              project.receipts.map((receipt, receiptIndex) => {
                const { totals, taxAmounts } = calculateReceiptTotals(receipt, project.friends);
                const receiptTotal = Object.values(totals).reduce((sum, v) => sum + v, 0);
                const isCollapsed = collapsedReceipts.has(receipt.id);
                return (
                  <React.Fragment key={receipt.id}>
                    {/* Receipt Header */}
                    <tr className="bg-zinc-900/80 group">
                      <td colSpan={project.friends.length + 2} className="px-3 py-2 border-b border-zinc-800/50 relative">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCollapse(receipt.id)}
                            className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
                          >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <span className="text-zinc-600 font-mono text-xs">#{receiptIndex + 1}</span>
                          <input
                            type="text"
                            value={receipt.name}
                            onChange={(e) => updateReceipt({ ...receipt, name: e.target.value })}
                            data-focus-id={receipt.id}
                            className="bg-transparent outline-none flex-1 font-medium text-zinc-300 placeholder-zinc-600 focus:text-white"
                            placeholder="Receipt Name"
                          />
                          {receiptTotal > 0 && (
                            <span className="flex items-baseline gap-1">
                              <span className="italic text-zinc-600 text-[10px]">sum</span>
                              <span className="font-mono text-zinc-200 text-xs font-medium">{receiptTotal.toFixed(2)}</span>
                            </span>
                          )}
                          <button onClick={() => removeReceipt(receipt.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all text-zinc-500 mr-2">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {!isCollapsed && (
                      <>
                        {/* Items */}
                        {receipt.items.map((item, itemIndex) => (
                          <tr key={item.id} className="border-b border-zinc-800/50 bg-[#09090b] hover:bg-zinc-900/40 transition-colors group">
                            <td className="py-1.5 pr-3 pl-6 relative sticky left-0 z-10 bg-[#09090b] group-hover:bg-zinc-900/40 transition-colors">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-zinc-700"></div>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItemName(receipt.id, item.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addItem(receipt.id, true);
                                  }
                                }}
                                data-focus-id={item.id}
                                className="bg-transparent outline-none w-full text-zinc-300 placeholder-zinc-700"
                                placeholder="Item Name"
                              />
                              <button onClick={() => removeItem(receipt.id, item.id)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity">
                                <Trash2 size={14} />
                              </button>
                            </td>
                            {project.friends.map((f, friendIndex) => (
                              <td key={f.id} className="p-0 border-l border-zinc-800/50 relative">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.splits[f.id] || ''}
                                  onChange={(e) => updateItemSplit(receipt.id, item.id, f.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === 'Tab' &&
                                      !e.shiftKey &&
                                      friendIndex === project.friends.length - 1 &&
                                      itemIndex === receipt.items.length - 1
                                    ) {
                                      e.preventDefault();
                                      addItem(receipt.id, true);
                                    }
                                  }}
                                  className="w-full h-full py-1.5 px-3 bg-transparent outline-none text-center text-zinc-300 focus:bg-zinc-900/50 transition-colors"
                                  placeholder="-"
                                />
                              </td>
                            ))}
                            <td className="border-l border-zinc-800/50"></td>
                          </tr>
                        ))}

                        {/* Add Item Row */}
                        <tr className="border-b border-zinc-800/50 bg-[#09090b]">
                          <td colSpan={project.friends.length + 2} className="py-1.5 pl-6">
                            <button onClick={() => addItem(receipt.id, true)} className="text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
                              <Plus size={12}/> Add item
                            </button>
                          </td>
                        </tr>

                        {/* Tax Row */}
                        <tr className="border-b border-zinc-800/50 bg-zinc-900/20">
                          <td className="py-1.5 pr-3 pl-6 text-zinc-400 flex items-center gap-2 sticky left-0 z-10 bg-[#09090b]">
                            <input
                              type="number"
                              value={receipt.taxPercentage || ''}
                              onChange={e => updateReceipt({ ...receipt, taxPercentage: parseFloat(e.target.value) || 0 })}
                              className="w-10 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 outline-none text-right text-zinc-300 focus:border-zinc-600"
                              placeholder="0"
                            />
                            <span className="text-xs uppercase tracking-wider">Tax %</span>
                          </td>
                          {project.friends.map(f => (
                            <td key={f.id} className="py-1.5 px-3 text-center border-l border-zinc-800/50 text-zinc-500 font-mono">
                              {taxAmounts[f.id] > 0 ? taxAmounts[f.id].toFixed(2) : '–'}
                            </td>
                          ))}
                          <td></td>
                        </tr>

                        {/* Sub Total Row */}
                        <tr className="border-b-4 border-zinc-800 bg-zinc-900/60">
                          <td className="py-1.5 pr-3 pl-6 text-zinc-300 font-medium sticky left-0 z-10 bg-zinc-900">Sub Total</td>
                          {project.friends.map(f => (
                            <td key={f.id} className="py-1.5 px-3 text-center border-l border-zinc-800/50 font-mono text-zinc-200">
                              {totals[f.id] > 0 ? totals[f.id].toFixed(2) : '–'}
                            </td>
                          ))}
                          <td></td>
                        </tr>
                      </>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
          {hasReceipts && (
            <tfoot className="sticky bottom-0 z-20">
              <tr className="bg-zinc-800 text-zinc-100 font-medium text-base">
                <td className="p-3 rounded-bl-xl sticky left-0 z-30 bg-zinc-800">Total</td>
                {project.friends.map(f => (
                  <td key={f.id} className="p-3 text-center border-l border-zinc-700 font-mono">
                    {grandTotals[f.id] > 0 ? grandTotals[f.id].toFixed(2) : '–'}
                  </td>
                ))}
                <td className="rounded-br-xl border-l border-zinc-700"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {hasReceipts && (
        <button
          onClick={addReceipt}
          className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl p-3 transition-colors"
        >
          <Plus size={16} /> New Receipt
        </button>
      )}
    </div>
  );
};
