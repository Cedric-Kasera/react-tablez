/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export type SortOrder = 'asc' | 'desc' | null;

export interface Column<T> {
  /** Unique key for the column. Can be a nested path, e.g. "user.profile.name" */
  key: string;
  
  /** Header label or custom React node to render in the table header */
  header: React.ReactNode;
  
  /** Whether the column is sortable */
  sortable?: boolean;
  
  /** Whether the column is filterable. If true, column-specific filtering is enabled */
  filterable?: boolean;
  
  /** Data type of the column. Helps with natural sorting and filtering */
  dataType?: 'string' | 'number' | 'date' | 'boolean';
  
  /** Optional custom cell renderer */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  
  /** Optional custom sort comparison function for this column */
  sortType?: (a: any, b: any) => number;
  
  /** Custom header Tailwind classes */
  headerClassName?: string;
  
  /** Custom cell Tailwind classes */
  cellClassName?: string;
}

export interface RowAction<T> {
  /** Unique action name or identifier */
  name: string;
  
  /** Label for the action */
  label: React.ReactNode;
  
  /** Icon component to render alongside or in place of the label */
  icon?: React.ReactNode;
  
  /** Click event handler */
  onClick: (row: T, index: number) => void;
  
  /** Tailwind CSS classes for the action button */
  className?: string;
  
  /** Callback to determine if this action should be shown for a given row */
  show?: (row: T, index: number) => boolean;
}

export interface TableClassNames {
  wrapper?: string;
  table?: string;
  thead?: string;
  trHeader?: string;
  th?: string;
  tbody?: string;
  trRow?: string;
  td?: string;
  pagination?: string;
  paginationButton?: string;
  globalFilterWrapper?: string;
  globalFilterInput?: string;
  columnFiltersWrapper?: string;
  columnFilterInput?: string;
  actionsWrapper?: string;
  actionsButton?: string;
  emptyState?: string;
  loadingState?: string;
}

export interface ControlledPagination {
  pageSize: number;
  pageSizeOptions?: number[];
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface ControlledSorting {
  sortBy: string | null;
  sortOrder: SortOrder;
  onSort: (sortBy: string | null, sortOrder: SortOrder) => void;
}

export interface ControlledFiltering {
  globalFilter?: string;
  onGlobalFilterChange?: (filterValue: string) => void;
  columnFilters?: Record<string, any>;
  onColumnFilterChange?: (filters: Record<string, any>) => void;
}

export interface TableProps<T> {
  /** Array of objects representing row data */
  data: T[];
  
  /** Array of column definitions */
  columns: Column<T>[];
  
  /** Unique key for each row. Can be a key of the object or a function resolving to a string/number */
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  
  /** Loading state. Renders a loading skeleton or indicator when true */
  loading?: boolean;
  
  /** Custom loading element */
  loadingElement?: React.ReactNode;
  
  /** Custom empty state element to display when there is no data */
  emptyState?: React.ReactNode;
  
  /** Custom row actions (e.g. edit, delete) */
  actions?: RowAction<T>[];
  
  /** Column header title for the Actions column. Defaults to 'Actions' */
  actionsHeader?: string;
  
  /** Whether to render actions as an inline button group or a dropdown menu. Defaults to 'inline' */
  actionsLayout?: 'inline' | 'dropdown';
  
  /** Styling theme. Supports 'light', 'dark', or syncing with system theme 'auto'. Defaults to 'light' */
  theme?: 'light' | 'dark' | 'auto';
  
  /** Enables card-based layout on mobile viewports (< 768px). Defaults to true */
  responsiveCards?: boolean;
  
  /** Custom Tailwind CSS classes to override default styling */
  classNames?: TableClassNames;
  
  /** Settings for controlled pagination. If omitted, internal pagination is used if standardPagination is enabled */
  controlledPagination?: ControlledPagination;
  
  /** Settings for controlled sorting. If omitted, internal sorting is used */
  controlledSorting?: ControlledSorting;
  
  /** Settings for controlled filtering. If omitted, internal filtering is used */
  controlledFiltering?: ControlledFiltering;
  
  /** Enable internal pagination if not controlled. Defaults to true */
  pagination?: boolean;
  
  /** Initial page size for internal pagination. Defaults to 10 */
  defaultPageSize?: number;
  
  /** Page size selection options for internal pagination. Defaults to [5, 10, 20, 50] */
  pageSizeOptions?: number[];
  
  /** Enable global text filtering. Defaults to true */
  globalFilter?: boolean;
  
  /** Placeholder for global filter input. Defaults to 'Search...' */
  globalFilterPlaceholder?: string;
  
  /** Enable column-specific filters. Defaults to false */
  columnFilters?: boolean;
}
