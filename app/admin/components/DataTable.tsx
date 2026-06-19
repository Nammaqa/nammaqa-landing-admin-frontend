import React, { useState, useMemo } from "react";
import { Edit2, Trash2, Plus, Search, ChevronLeft, ChevronRight, Loader2, Eye } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (val: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onPreview?: (item: any) => void;
  onDelete: (id: string | number) => void;
  onCreate: () => void;
  itemsPerPage?: number;
  isLoading?: boolean;
}

export default function DataTable({ 
  title, 
  columns, 
  data, 
  onEdit, 
  onPreview,
  onDelete, 
  onCreate,
  itemsPerPage = 10,
  isLoading = false
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter((item) => 
      columns.some((col) => {
        const val = item[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lowerQuery);
      })
    );
  }, [data, searchQuery, columns]);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-800/50">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <button
            onClick={onCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-transform hover:scale-105 active:scale-95 whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 font-semibold tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-14 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    <span className="text-sm font-medium">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery ? "No matches found." : "No records found."}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-gray-700/30 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 ${['address', 'description', 'title', 'image_title'].includes(col.key) ? 'whitespace-normal break-words max-w-[28rem]' : 'whitespace-nowrap'}`}
                    >
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      {onPreview ? (
                        <button
                          onClick={() => onPreview(item)}
                          className="p-2 text-gray-300 hover:bg-gray-300/5 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : null}
                      {onEdit ? (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      ) : null}
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing <span className="font-medium text-white">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium text-white">{filteredData.length}</span> results
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-300 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
