import React, { useState } from 'react';
import type { Project, Receipt, Item } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { calculateReceiptTotals, calculateGrandTotals } from '../utils/calculations';

interface BreakdownTableProps {
  project: Project;
  updateProject: (p: Project) => void;
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({ project, updateProject }) => {
  const [newTag, setNewTag] = useState('');

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

  const addItem = (receiptId: string) => {
    const receipt = project.receipts.find(r => r.id === receiptId);
    if (!receipt) return;
    const newItem: Item = { id: uuidv4(), name: '', splits: {} };
    updateReceipt({ ...receipt, items: [...receipt.items, newItem] });
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


  return (
    <div className="w-full">
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-zinc-100">{project.name}</h2>
            <div className="text-zinc-500 text-sm mt-1">{new Date(project.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
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

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr>
              <th className="p-3 bg-zinc-900 text-zinc-300 font-medium rounded-tl-xl w-[240px] border-b border-zinc-800">
                <button onClick={addReceipt} className="flex items-center gap-2 text-sm hover:text-zinc-100 transition-colors">
                  <Plus size={16} /> New Receipt
                </button>
              </th>
              {project.friends.map(f => (
                <th key={f.id} className="p-3 bg-zinc-900/50 text-zinc-200 font-medium min-w-[120px] relative group border-b border-zinc-800 border-l border-zinc-800/50">
                  <input
                    type="text"
                    value={f.name}
                    onChange={(e) => updateFriendName(f.id, e.target.value)}
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
              <th className="p-3 bg-zinc-900 text-zinc-400 font-medium rounded-tr-xl w-12 border-b border-zinc-800 border-l border-zinc-800/50">
                <button onClick={addFriend} className="hover:text-zinc-200 transition-colors w-full flex justify-center">
                  <Plus size={18} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {project.receipts.map(receipt => {
              const { totals, taxAmounts } = calculateReceiptTotals(receipt, project.friends);
              return (
                <React.Fragment key={receipt.id}>
                  {/* Receipt Header */}
                  <tr className="bg-zinc-900/80 group">
                    <td colSpan={project.friends.length + 2} className="p-3 border-b border-zinc-800/50 relative">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-600 font-mono text-xs">#</span>
                        <input
                          type="text"
                          value={receipt.name}
                          onChange={(e) => updateReceipt({ ...receipt, name: e.target.value })}
                          className="bg-transparent outline-none flex-1 font-medium text-zinc-300 placeholder-zinc-600 focus:text-white"
                          placeholder="Receipt Name"
                        />
                        <button onClick={() => removeReceipt(receipt.id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all text-zinc-500 mr-2">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Items */}
                  {receipt.items.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 bg-[#09090b] hover:bg-zinc-900/40 transition-colors group">
                      <td className="p-3 relative border-r border-zinc-800/50 pl-6">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-zinc-700"></div>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItemName(receipt.id, item.id, e.target.value)}
                          className="bg-transparent outline-none w-full text-zinc-300 placeholder-zinc-700"
                          placeholder="Item Name"
                        />
                        <button onClick={() => removeItem(receipt.id, item.id)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      </td>
                      {project.friends.map(f => (
                        <td key={f.id} className="p-0 border-r border-zinc-800/50 relative">
                          <input
                            type="number"
                            step="0.01"
                            value={item.splits[f.id] || ''}
                            onChange={(e) => updateItemSplit(receipt.id, item.id, f.id, e.target.value)}
                            className="w-full h-full p-3 bg-transparent outline-none text-center text-zinc-300 focus:bg-zinc-900/50 transition-colors"
                            placeholder="-"
                          />
                        </td>
                      ))}
                      <td></td>
                    </tr>
                  ))}

                  {/* Add Item Row */}
                  <tr className="border-b border-zinc-800/50 bg-[#09090b]">
                    <td colSpan={project.friends.length + 2} className="p-2 border-r border-zinc-800/50 pl-6">
                      <button onClick={() => addItem(receipt.id)} className="text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors">
                        <Plus size={12}/> Add item
                      </button>
                    </td>
                  </tr>

                  {/* Tax Row */}
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/20">
                    <td className="p-3 pl-6 border-r border-zinc-800/50 text-zinc-400 flex items-center gap-2">
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
                      <td key={f.id} className="p-3 text-center border-r border-zinc-800/50 text-zinc-500 font-mono">
                        {taxAmounts[f.id] > 0 ? taxAmounts[f.id].toFixed(2) : '–'}
                      </td>
                    ))}
                    <td></td>
                  </tr>

                  {/* Total Row */}
                  <tr className="border-b-4 border-zinc-800 bg-zinc-900/60">
                    <td className="p-3 pl-6 border-r border-zinc-800/50 text-zinc-300 font-medium">Sub Total</td>
                    {project.friends.map(f => (
                      <td key={f.id} className="p-3 text-center border-r border-zinc-800/50 font-mono text-zinc-200">
                        {totals[f.id] > 0 ? totals[f.id].toFixed(2) : '–'}
                      </td>
                    ))}
                    <td></td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-zinc-800 text-zinc-100 font-medium text-base">
              <td className="p-4 rounded-bl-xl border-r border-zinc-700">Total</td>
              {project.friends.map(f => (
                <td key={f.id} className="p-4 text-center border-r border-zinc-700 font-mono">
                  {grandTotals[f.id] > 0 ? grandTotals[f.id].toFixed(2) : '–'}
                </td>
              ))}
              <td className="rounded-br-xl"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
