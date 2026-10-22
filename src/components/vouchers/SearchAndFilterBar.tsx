import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { useVouchers } from '../../context/VoucherContext';
import { DEPARTMENTS, EXPENSE_CATEGORIES } from '../../lib/initialData';
import { useAuth } from '../../context/AuthContext';

export const SearchAndFilterBar: React.FC = () => {
  const { filter, setFilter, resetFilter, allVouchers, vouchers } = useVouchers();
  const { currentUser } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Guarantee clean filter bar state when switching accounts
  React.useEffect(() => {
    setShowAdvanced(false);
  }, [currentUser?.id]);

  const activeFilterCount = [
    Boolean(filter.department),
    Boolean(filter.category),
    Boolean(filter.status),
    Boolean(filter.startDate),
    Boolean(filter.endDate),
    Boolean(filter.minAmount),
    Boolean(filter.maxAmount),
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xs space-y-3 transition-colors">
      {/* Primary search bar & fast controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder={
              currentUser?.role === 'employee'
                ? "Search your vouchers by voucher #, title, or details..."
                : "Search vouchers by number, employee name, title..."
            }
            className="w-full pl-10 pr-4 py-2 text-xs bg-neutral-50/70 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:bg-white dark:focus:bg-neutral-800 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition-colors"
          />
          {filter.searchQuery && (
            <button
              onClick={() => setFilter(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              clear
            </button>
          )}
        </div>

        {/* Quick Status Select */}
        <div className="w-full sm:w-44">
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            aria-label="Filter by voucher status"
            className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="w-full sm:w-44">
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
            aria-label="Sort vouchers by"
            className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-100"
          >
            <option value="date-desc">Newest Expense Date</option>
            <option value="date-asc">Oldest Expense Date</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
            <option value="voucher-desc">Voucher Number (Desc)</option>
          </select>
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
            showAdvanced || activeFilterCount > 0
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-white/20 dark:bg-neutral-900/20 text-current rounded text-[10px] font-mono">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Reset Filter Button */}
        {(filter.searchQuery || activeFilterCount > 0) && (
          <button
            type="button"
            onClick={resetFilter}
            title="Reset all filters"
            className="p-2 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters Expandable Grid */}
      {showAdvanced && (
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Department
            </label>
            <select
              value={filter.department}
              onChange={(e) => setFilter(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs text-neutral-800 dark:text-neutral-200"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Expense Category */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Expense Category
            </label>
            <select
              value={filter.category}
              onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs text-neutral-800 dark:text-neutral-200"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Expense Date Range */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Expense Date Range
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                aria-label="Filter expense start date"
                className="w-1/2 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-[11px] text-neutral-800 dark:text-neutral-200"
              />
              <span className="text-neutral-400">to</span>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                aria-label="Filter expense end date"
                className="w-1/2 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-[11px] text-neutral-800 dark:text-neutral-200"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Amount Range ($)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filter.minAmount}
                onChange={(e) => setFilter(prev => ({ ...prev, minAmount: e.target.value }))}
                className="w-1/2 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs text-neutral-800 dark:text-neutral-200 font-mono"
              />
              <span className="text-neutral-400">-</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filter.maxAmount}
                onChange={(e) => setFilter(prev => ({ ...prev, maxAmount: e.target.value }))}
                className="w-1/2 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-xs text-neutral-800 dark:text-neutral-200 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Result counter indicator */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
        <span>
          Showing <strong className="text-neutral-800 dark:text-neutral-200 font-mono">{vouchers.length}</strong> of{' '}
          <strong className="text-neutral-800 dark:text-neutral-200 font-mono">{allVouchers.length}</strong> records
        </span>
        {activeFilterCount > 0 && (
          <span className="text-neutral-400 dark:text-neutral-500">
            {activeFilterCount} active {activeFilterCount === 1 ? 'criterion' : 'criteria'} applied
          </span>
        )}
      </div>
    </div>
  );
};
