import React, { useState, useMemo, useEffect } from 'react';
import type { Column, TableProps, SortOrder } from '../types';
import { getNestedValue, defaultCompare, matchesQuery } from '../utils';

const EMPTY_FILTERS: Record<string, string> = {};

export function Table<T>({
  data,
  columns,
  rowKey,
  loading = false,
  loadingElement,
  emptyState,
  actions,
  actionsHeader = 'Actions',
  actionsLayout = 'inline',
  theme = 'light',
  responsiveCards = true,
  classNames = {},
  controlledPagination,
  controlledSorting,
  controlledFiltering,
  pagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  globalFilter = true,
  globalFilterPlaceholder = 'Search...',
  columnFilters = false,
}: TableProps<T>) {
  // --- Uncontrolled States (used if controlled props are not supplied) ---
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
  const [internalSortBy, setInternalSortBy] = useState<string | null>(null);
  const [internalSortOrder, setInternalSortOrder] = useState<SortOrder>(null);
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('');
  const [internalColumnFilters, setInternalColumnFilters] = useState<Record<string, string>>({});
  
  // Dropdown states for actions menu (if layout is 'dropdown')
  const [openDropdownRowIndex, setOpenDropdownRowIndex] = useState<number | null>(null);

  // Track previous data length and page size to reset page when they change
  const [prevDataLength, setPrevDataLength] = useState(data.length);
  const [prevPageSize, setPrevPageSize] = useState(internalPageSize);

  if (data.length !== prevDataLength || internalPageSize !== prevPageSize) {
    setPrevDataLength(data.length);
    setPrevPageSize(internalPageSize);
    setInternalPage(1);
  }

  // Close dropdown on window click
  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenDropdownRowIndex(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // --- State Selectors (Controlled vs Uncontrolled) ---
  const isPaginationControlled = !!controlledPagination;
  const isSortingControlled = !!controlledSorting;
  const isFilteringControlled = !!controlledFiltering;

  const currentPage = isPaginationControlled ? controlledPagination.currentPage : internalPage;
  const pageSize = isPaginationControlled ? controlledPagination.pageSize : internalPageSize;
  const sortBy = isSortingControlled ? controlledSorting.sortBy : internalSortBy;
  const sortOrder = isSortingControlled ? controlledSorting.sortOrder : internalSortOrder;
  const globalFilterValue = isFilteringControlled ? (controlledFiltering.globalFilter || '') : internalGlobalFilter;
  const columnFilterValues = isFilteringControlled ? (controlledFiltering.columnFilters || EMPTY_FILTERS) : internalColumnFilters;

  // --- Handlers ---
  const handlePageChange = (page: number) => {
    if (isPaginationControlled) {
      controlledPagination.onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (isPaginationControlled && controlledPagination.onPageSizeChange) {
      controlledPagination.onPageSizeChange(size);
    } else {
      setInternalPageSize(size);
      setInternalPage(1);
    }
  };

  const handleSort = (columnKey: string) => {
    const column = columns.find(c => c.key === columnKey);
    if (!column || !column.sortable) return;

    let nextOrder: SortOrder = 'asc';
    if (sortBy === columnKey) {
      if (sortOrder === 'asc') nextOrder = 'desc';
      else if (sortOrder === 'desc') nextOrder = null;
      else nextOrder = 'asc';
    }

    const nextSortBy = nextOrder ? columnKey : null;

    if (isSortingControlled) {
      controlledSorting.onSort(nextSortBy, nextOrder);
    } else {
      setInternalSortBy(nextSortBy);
      setInternalSortOrder(nextOrder);
      setInternalPage(1);
    }
  };

  const handleGlobalFilterChange = (val: string) => {
    if (isFilteringControlled && controlledFiltering.onGlobalFilterChange) {
      controlledFiltering.onGlobalFilterChange(val);
    } else {
      setInternalGlobalFilter(val);
      setInternalPage(1);
    }
  };

  const handleColumnFilterChange = (columnKey: string, val: string) => {
    const nextFilters = { ...columnFilterValues, [columnKey]: val };
    if (!val) {
      delete nextFilters[columnKey];
    }

    if (isFilteringControlled && controlledFiltering.onColumnFilterChange) {
      controlledFiltering.onColumnFilterChange(nextFilters);
    } else {
      setInternalColumnFilters(nextFilters);
      setInternalPage(1);
    }
  };

  // --- Data Processing (Sorting, Filtering, Pagination) ---
  // Note: Only performed locally if not controlled
  const processedData = useMemo(() => {
    // If pagination, sorting, and filtering are ALL controlled, we just use the raw data
    // because the parent component is handling it.
    let result = [...data];

    // 1. Column Filtering
    if (!isFilteringControlled) {
      const activeColFilters = Object.entries(columnFilterValues).filter(([, val]) => !!val);
      if (activeColFilters.length > 0) {
        result = result.filter(row => {
          return activeColFilters.every(([key, filterVal]) => {
            const val = getNestedValue(row, key);
            return matchesQuery(val, filterVal);
          });
        });
      }

      // 2. Global Filtering
      if (globalFilter && globalFilterValue) {
        result = result.filter(row => {
          return columns.some(col => {
            const val = getNestedValue(row, col.key);
            return matchesQuery(val, globalFilterValue);
          });
        });
      }
    }

    // 3. Sorting
    if (!isSortingControlled && sortBy && sortOrder) {
      const column = columns.find(c => c.key === sortBy);
      if (column) {
        result.sort((a, b) => {
          const valA = getNestedValue(a, sortBy);
          const valB = getNestedValue(b, sortBy);

          const comparison = column.sortType
            ? column.sortType(valA, valB)
            : defaultCompare(valA, valB, column.dataType);

          return sortOrder === 'asc' ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [
    data,
    columns,
    sortBy,
    sortOrder,
    globalFilterValue,
    columnFilterValues,
    isFilteringControlled,
    isSortingControlled,
    globalFilter,
  ]);

  // Paginated View data
  const paginatedData = useMemo(() => {
    // If pagination is controlled or disabled, return processed data as is
    if (isPaginationControlled || !pagination) {
      return processedData;
    }

    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize, isPaginationControlled, pagination]);

  const totalItems = isPaginationControlled
    ? (controlledPagination.totalItems ?? data.length)
    : processedData.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // --- Rendering Helpers ---
  const getRowKey = (row: T, idx: number): string | number => {
    if (rowKey) {
      if (typeof rowKey === 'function') return rowKey(row, idx);
      return row[rowKey] as unknown as string | number;
    }
    return idx;
  };

  // Safe theme class resolution
  const themeClass = theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : '';

  // Render sorting arrows
  const renderSortIndicator = (column: Column<T>) => {
    if (!column.sortable) return null;
    const isSorted = sortBy === column.key;
    
    return (
      <span className="inline-flex ml-1.5 align-middle select-none transition-colors duration-200">
        {isSorted && sortOrder === 'asc' ? (
          <svg className="w-3 h-3 text-violet-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        ) : isSorted && sortOrder === 'desc' ? (
          <svg className="w-3 h-3 text-violet-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </span>
    );
  };

  return (
    <div className={`${themeClass} w-full`}>
      <div className={`
        bg-white dark:bg-slate-900 
        text-slate-700 dark:text-slate-200 
        shadow-md rounded-xl border border-slate-200 dark:border-slate-800 
        overflow-hidden transition-all duration-300
        ${classNames.wrapper || ''}
      `}>
        
        {/* --- Top Filter Bar --- */}
        {globalFilter && !isFilteringControlled && (
          <div className={`p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 ${classNames.globalFilterWrapper || ''}`}>
            <div className="relative w-full max-w-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={globalFilterValue}
                onChange={(e) => handleGlobalFilterChange(e.target.value)}
                placeholder={globalFilterPlaceholder}
                className={`
                  w-full pl-10 pr-4 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-850
                  border-slate-200 dark:border-slate-700
                  focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                  outline-none transition-all duration-200
                  text-slate-800 dark:text-slate-150
                  placeholder-slate-400 dark:placeholder-slate-500
                  ${classNames.globalFilterInput || ''}
                `}
              />
            </div>
            {/* Slot for additional header content or actions if needed */}
          </div>
        )}

        {/* --- Table Container --- */}
        <div className="w-full overflow-x-auto">
          {/* Card View for Mobile (only active if responsiveCards is true) */}
          {responsiveCards && (
            <div className="block md:hidden p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
              {loading ? (
                loadingElement || (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-750 w-1/3 rounded"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-750 w-2/3 rounded"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-750 w-1/2 rounded"></div>
                      </div>
                    ))}
                  </div>
                )
              ) : paginatedData.length === 0 ? (
                emptyState || (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    No data available
                  </div>
                )
              ) : (
                paginatedData.map((row, idx) => (
                  <div
                    key={getRowKey(row, idx)}
                    className="p-4 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    {columns.map((col) => {
                      const cellVal = getNestedValue(row, col.key);
                      return (
                        <div key={col.key} className="flex justify-between items-start gap-4">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {col.header}
                          </span>
                          <span className={`text-sm text-slate-800 dark:text-slate-200 text-right ${col.cellClassName || ''}`}>
                            {col.render ? col.render(cellVal, row, idx) : String(cellVal ?? '')}
                          </span>
                        </div>
                      );
                    })}

                    {/* Actions on Mobile Card */}
                    {actions && actions.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 flex-wrap">
                        {actions.map((act) => {
                          if (act.show && !act.show(row, idx)) return null;
                          return (
                            <button
                              key={act.name}
                              onClick={() => act.onClick(row, idx)}
                              className={`
                                inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                                border border-slate-200 dark:border-slate-700
                                text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-800
                                hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-violet-600 dark:hover:text-violet-400
                                focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-200
                                ${act.className || ''}
                              `}
                            >
                              {act.icon}
                              {act.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Standard HTML Table for Desktop / Large Screen */}
          <table className={`
            min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left border-collapse
            ${responsiveCards ? 'hidden md:table' : 'table'}
            ${classNames.table || ''}
          `}>
            
            {/* --- Headers --- */}
            <thead className={`
              bg-slate-50 dark:bg-slate-850/50 select-none
              ${classNames.thead || ''}
            `}>
              <tr className={classNames.trHeader}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    scope="col"
                    className={`
                      px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400
                      ${col.sortable ? 'cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:text-slate-700 dark:hover:text-slate-200' : ''}
                      transition-all duration-200
                      ${col.headerClassName || ''}
                      ${classNames.th || ''}
                    `}
                  >
                    <div className="flex items-center">
                      {col.header}
                      {renderSortIndicator(col)}
                    </div>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th scope="col" className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right ${classNames.th || ''}`}>
                    {actionsHeader}
                  </th>
                )}
              </tr>

              {/* Column-specific Filtering row */}
              {columnFilters && !isFilteringControlled && (
                <tr className={classNames.columnFiltersWrapper}>
                  {columns.map((col) => (
                    <th key={col.key} className="px-6 py-2 bg-slate-50/50 dark:bg-slate-850/20">
                      {col.filterable ? (
                        <input
                          type="text"
                          value={columnFilterValues[col.key] || ''}
                          onChange={(e) => handleColumnFilterChange(col.key, e.target.value)}
                          placeholder={`Filter...`}
                          className={`
                            w-full px-2.5 py-1 border rounded text-xs bg-white dark:bg-slate-800
                            border-slate-200 dark:border-slate-700
                            focus:ring-1 focus:ring-violet-500 focus:border-violet-500
                            outline-none transition-all duration-150
                            text-slate-800 dark:text-slate-200
                            ${classNames.columnFilterInput || ''}
                          `}
                        />
                      ) : null}
                    </th>
                  ))}
                  {actions && actions.length > 0 && <th className="px-6 py-2 bg-slate-50/50 dark:bg-slate-850/20"></th>}
                </tr>
              )}
            </thead>

            {/* --- Body --- */}
            <tbody className={`
              divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900
              ${classNames.tbody || ''}
            `}>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-10">
                    {loadingElement || (
                      <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-4">
                            {columns.map((col) => (
                              <div key={col.key} className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1"></div>
                            ))}
                            {actions && actions.length > 0 && <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                        <svg className="w-8 h-8 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-sm font-medium">No results found</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIdx) => (
                  <tr
                    key={getRowKey(row, rowIdx)}
                    className={`
                      hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors duration-150
                      ${classNames.trRow || ''}
                    `}
                  >
                    {columns.map((col) => {
                      const cellVal = getNestedValue(row, col.key);
                      return (
                        <td
                          key={col.key}
                          className={`
                            px-6 py-4.5 text-sm whitespace-nowrap text-slate-800 dark:text-slate-200
                            ${col.cellClassName || ''}
                            ${classNames.td || ''}
                          `}
                        >
                          {col.render ? col.render(cellVal, row, rowIdx) : String(cellVal ?? '')}
                        </td>
                      );
                    })}

                    {/* Actions Column */}
                    {actions && actions.length > 0 && (
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium relative ${classNames.td || ''}`}>
                        {actionsLayout === 'inline' ? (
                          <div className={`inline-flex items-center gap-2 ${classNames.actionsWrapper || ''}`}>
                            {actions.map((act) => {
                              if (act.show && !act.show(row, rowIdx)) return null;
                              return (
                                <button
                                  key={act.name}
                                  onClick={() => act.onClick(row, rowIdx)}
                                  title={typeof act.label === 'string' ? act.label : undefined}
                                  className={`
                                    inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded border
                                    bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                                    text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400
                                    hover:bg-slate-55 dark:hover:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-violet-500
                                    transition-all duration-200
                                    ${act.className || ''}
                                    ${classNames.actionsButton || ''}
                                  `}
                                >
                                  {act.icon}
                                  {act.label}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownRowIndex(openDropdownRowIndex === rowIdx ? null : rowIdx);
                              }}
                              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>

                            {openDropdownRowIndex === rowIdx && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1.5 w-40 rounded-lg shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-30 focus:outline-none py-1"
                              >
                                {actions.map((act) => {
                                  if (act.show && !act.show(row, rowIdx)) return null;
                                  return (
                                    <button
                                      key={act.name}
                                      onClick={() => {
                                        act.onClick(row, rowIdx);
                                        setOpenDropdownRowIndex(null);
                                      }}
                                      className={`
                                        w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300
                                        hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-violet-600 dark:hover:text-violet-400
                                        flex items-center gap-2
                                        ${act.className || ''}
                                      `}
                                    >
                                      {act.icon}
                                      {act.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Footer --- */}
        {pagination && totalItems > 0 && (
          <div className={`
            px-6 py-4.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/10
            flex items-center justify-between flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400
            ${classNames.pagination || ''}
          `}>
            
            {/* Record range display */}
            <div>
              Showing{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {Math.min(totalItems, (currentPage - 1) * pageSize + 1)}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {Math.min(totalItems, currentPage * pageSize)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span>{' '}
              entries
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Page size dropdown */}
              <div className="flex items-center gap-1.5">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-violet-500 outline-none"
                >
                  {(isPaginationControlled && controlledPagination.pageSizeOptions
                    ? controlledPagination.pageSizeOptions
                    : pageSizeOptions
                  ).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span>entries</span>
              </div>

              {/* Prev / Page numbers / Next controls */}
              <nav className="inline-flex gap-1" aria-label="Pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`
                    px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200
                    ${currentPage === 1
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-violet-600 dark:hover:text-violet-400'
                    }
                    ${classNames.paginationButton || ''}
                  `}
                >
                  Previous
                </button>

                {/* Flexible numbered pages */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, current, and pages adjacent to current
                    return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
                  })
                  .map((p, index, array) => {
                    const showEllipsis = index > 0 && p - array[index - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-2.5 py-1.5 text-slate-400 dark:text-slate-600 select-none">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePageChange(p)}
                          aria-current={p === currentPage ? 'page' : undefined}
                          className={`
                            px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${p === currentPage
                              ? 'bg-violet-600 dark:bg-violet-600 text-white border border-violet-600 font-semibold shadow-sm shadow-violet-500/20'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-violet-600 dark:hover:text-violet-400'
                            }
                            ${classNames.paginationButton || ''}
                          `}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`
                    px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200
                    ${currentPage === totalPages
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-violet-600 dark:hover:text-violet-400'
                    }
                    ${classNames.paginationButton || ''}
                  `}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
