"use client";

import { useEffect, useState } from "react";
import { DashboardItem, Walk } from "../../interfaces/dashboard";

interface AdminTableProps {
  data: (DashboardItem | Walk)[];
  type: 'monument' | 'event' | 'walk';
  isLoading: boolean;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onBulkDelete?: (items: any[]) => void;
}

export default function AdminTable({ data, type, isLoading, onEdit, onDelete, onBulkDelete }: AdminTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Sync selectedIds with data (remove deleted items)
  useEffect(() => {
      setSelectedIds(prev => prev.filter(id => data.some(item => item.id === id)));
  }, [data]);

  const filteredData = data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type !== 'walk' && (item as DashboardItem).address?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          setSelectedIds(filteredData.map(i => i.id));
      } else {
          setSelectedIds([]);
      }
  };

  const handleSelectOne = (id: string | number) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const handleDeleteSelected = () => {
      if (!onBulkDelete) return;
      const itemsToDelete = data.filter(i => selectedIds.includes(i.id));
      onBulkDelete(itemsToDelete);
  };

  const isLoadingLocal = isLoading || false;

  return (
    <div className="bg-surface border border-divider/10 rounded-xl overflow-hidden shadow-lg min-h-[400px]">
      <div className="p-4 border-b border-divider/10 flex justify-between items-center bg-surface/50">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-secondary tracking-widest">{type}S</span>
                <span className="bg-accent text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {isLoadingLocal ? "..." : data.length}
                </span>
            </div>
            {!isLoadingLocal && selectedIds.length > 0 && onBulkDelete && (
                <button 
                    onClick={handleDeleteSelected}
                    className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors animate-in fade-in zoom-in duration-200"
                >
                    <i className="fa-solid fa-trash mr-2"></i>
                    Delete ({selectedIds.length})
                </button>
            )}
        </div>
        <input 
            type="text" 
            placeholder="Search..." 
            disabled={isLoadingLocal}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-canvas border border-divider/20 rounded-lg px-3 py-1.5 text-xs w-64 focus:border-accent focus:outline-none placeholder:text-secondary/50 disabled:opacity-50"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-canvas text-secondary text-xs font-mono uppercase tracking-wider border-b border-divider/10">
            <tr>
              <th className="px-6 py-3 font-medium w-16">
                  {!isLoadingLocal && (
                      <input 
                        type="checkbox" 
                        className="rounded border-divider/20 bg-surface/50 accent-accent w-4 h-4 cursor-pointer"
                        onChange={handleSelectAll}
                        checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                      />
                  )}
              </th>
              <th className="px-6 py-3 font-medium w-24">ID</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium w-48">Details</th>
              {type !== 'walk' && <th className="px-6 py-3 font-medium w-32">Status</th>}
              <th className="px-6 py-3 font-medium text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider/5">
            {isLoadingLocal ? (
                // SKELETON ROWS
                Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                        <td className="px-6 py-4"><div className="w-4 h-4 bg-divider/10 rounded"></div></td>
                        <td className="px-6 py-4"><div className="w-12 h-3 bg-divider/10 rounded"></div></td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-divider/10 rounded"></div>
                                <div className="w-32 h-4 bg-divider/10 rounded"></div>
                            </div>
                        </td>
                        <td className="px-6 py-4"><div className="w-24 h-4 bg-divider/10 rounded"></div></td>
                        {type !== 'walk' && <td className="px-6 py-4"><div className="w-16 h-4 bg-divider/10 rounded"></div></td>}
                        <td className="px-6 py-4"><div className="ml-auto w-12 h-6 bg-divider/10 rounded"></div></td>
                    </tr>
                ))
            ) : filteredData.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-secondary italic">
                        No items found matching "{searchTerm}"
                    </td>
                </tr>
            ) : filteredData.map((item) => (
              <tr key={item.id} className={`hover:bg-divider/5 transition-colors group ${selectedIds.includes(item.id) ? 'bg-accent/5' : ''}`}>
                <td className="px-6 py-4">
                    <input 
                        type="checkbox" 
                        className="rounded border-divider/20 bg-surface/50 accent-accent w-4 h-4 cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                    />
                </td>
                <td className="px-6 py-4 font-mono text-xs text-secondary truncate">{item.id}</td>
                <td className="px-6 py-4 font-medium text-primary">
                    <div className="flex items-center gap-3">
                        {type !== 'walk' && (item as DashboardItem).img && (
                            <img src={(item as DashboardItem).img} alt="" className="w-8 h-8 rounded object-cover bg-divider/20" />
                        )}
                        <div className="min-w-0">
                            <div className="line-clamp-1">{item.name}</div>
                            {type === 'walk' && (
                                <div className="text-[10px] text-secondary line-clamp-1">{(item as Walk).desc}</div>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-secondary text-xs">
                    {type === 'walk' ? (
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-surface border border-divider/10 text-[10px] uppercase font-bold tracking-wider">{(item as Walk).difficulty}</span>
                            <span>{(item as Walk).estTime}</span>
                        </div>
                    ) : (
                        <div>
                             <span className="block text-primary">{(item as DashboardItem).type}</span>
                             <span className="block text-[10px] opacity-70 truncate">{(item as DashboardItem).address}</span>
                        </div>
                    )}
                </td>
                {type !== 'walk' && (
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide
                            ${(item as DashboardItem).status === 'LIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                              (item as DashboardItem).status === 'MAINTENANCE' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                              'bg-red-500/10 text-red-500 border border-red-500/20'}
                        `}>
                            {(item as DashboardItem).status || 'UNKNOWN'}
                        </span>
                    </td>
                )}
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-secondary hover:text-accent hover:bg-accent/10 rounded transition-colors"
                            title="Edit"
                        >
                            <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                            onClick={() => onDelete(item)}
                            className="p-1.5 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete"
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
