# React Tailwind Grid Table (`@ohryzon/react-tablez`)

A lightweight, feature-rich, and highly customizable React Data Grid/Table component. Built for **React 19** and **Tailwind CSS v4**, this component is designed with speed, responsiveness, type safety, and premium aesthetics in mind.

---

## ✨ Features

- **⚡ Lightweight & Fast**: Designed with minimal footprint and optimized with React memoization (`useMemo`) to handle thousands of rows with no performance lag.
- **↕️ Smart Sorting**: Natural alphanumeric and date-based sorting out of the box, with support for custom sort comparators.
- **🔍 Multi-Level Filtering**: Features global text search filtering and column-specific inputs.
- **📄 Pagination**: Highly configurable pagination controls supporting customizable page sizes, bounds, and ellipses.
- **📱 Responsive Layout**: Adapts gracefully to smaller screens by optionally rendering rows as elegant mobile cards.
- **🌓 Dark & Light Modes**: Native support for dark/light themes, with options to sync with system preferences (`auto`) or force a specific mode.
- **🛠️ Flexible Column API**: Render nested JSON paths (e.g. `user.profile.name`) and write custom cell renderers for badges, actions, or interactive elements.
- **🔄 Dual State Model**: Use uncontrolled mode for immediate setup (internal state) or controlled mode for server-side sorting, searching, and paging.
- **🎨 Tailwind Customization**: Easily pass tailwind override classes to headers, cells, wrappers, or buttons via the `classNames` property.

---

## 📦 Installation

Install via npm, yarn, or pnpm:

```bash
# npm
npm install @ohryzon/react-tablez

# yarn
yarn add @ohryzon/react-tablez

# pnpm
pnpm add @ohryzon/react-tablez
```

---

## 🚀 Quick Start

Define your columns and data array, and mount the component:

```tsx
import { Table, Column } from '@ohryzon/react-tablez';

interface User {
  id: number;
  name: string;
  role: string;
  status: string;
}

const columns: Column<User>[] = [
  { key: 'name', header: 'Name', sortable: true, filterable: true },
  { key: 'role', header: 'Role', sortable: true },
  { 
    key: 'status', 
    header: 'Status', 
    render: (val) => (
      <span className={val === 'Active' ? 'text-green-500' : 'text-gray-500'}>
        ● {val}
      </span>
    )
  }
];

const data: User[] = [
  { id: 1, name: 'Alice Smith', role: 'Developer', status: 'Active' },
  { id: 2, name: 'Bob Johnson', role: 'Designer', status: 'Inactive' }
];

export default function Dashboard() {
  return (
    <Table<User>
      data={data}
      columns={columns}
      pagination={true}
      defaultPageSize={5}
    />
  );
}
```

---

## 🛠️ Advanced Integration

Below is an example showcasing advanced capabilities like **nested JSON path keys**, **row actions**, and **theme toggle selectors**:

```tsx
import React, { useState } from 'react';
import { Table, Column, RowAction } from '@ohryzon/react-tablez';

interface Employee {
  id: number;
  name: string;
  profile: {
    title: string;
    salary: number;
  };
  status: 'Active' | 'Inactive';
}

const columns: Column<Employee>[] = [
  { key: 'name', header: 'Employee Name', sortable: true },
  // Deep nested JSON property
  { key: 'profile.title', header: 'Position', sortable: true, filterable: true },
  { 
    key: 'profile.salary', 
    header: 'Annual Salary', 
    sortable: true, 
    dataType: 'number',
    render: (val) => `$${val.toLocaleString()}`
  },
  {
    key: 'status',
    header: 'Status',
    render: (val) => (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${val === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {val}
      </span>
    )
  }
];

export default function StaffDirectory() {
  const [staff, setStaff] = useState<Employee[]>([
    { id: 1, name: 'Sarah Connor', profile: { title: 'Engineering Lead', salary: 125000 }, status: 'Active' },
    { id: 2, name: 'John Miller', profile: { title: 'Senior Developer', salary: 98000 }, status: 'Active' }
  ]);

  const actions: RowAction<Employee>[] = [
    {
      name: 'edit',
      label: 'Edit',
      onClick: (row) => console.log('Editing row:', row)
    },
    {
      name: 'delete',
      label: 'Delete',
      onClick: (row) => setStaff((prev) => prev.filter((item) => item.id !== row.id)),
      className: 'text-red-600 hover:text-red-850'
    }
  ];

  return (
    <Table<Employee>
      data={staff}
      columns={columns}
      actions={actions}
      actionsLayout="dropdown" // Renders action choices as a dropdown menu
      theme="dark" // Supports 'light', 'dark', 'auto'
      pagination={true}
      defaultPageSize={10}
      columnFilters={true} // Column specific filter inputs
    />
  );
}
```

---

## ⚡ Server-Side Operations (Controlled State)

To manage pagination, sorting, and filtering externally (e.g. for server-side SQL queries or API pagination), pass the `controlled*` properties:

```tsx
<Table<User>
  data={apiData}
  columns={columns}
  
  // Controlled Pagination
  controlledPagination={{
    currentPage: page,
    pageSize: pageSize,
    totalItems: totalRowsOnServer,
    onPageChange: (newPage) => setPage(newPage),
    onPageSizeChange: (newSize) => setPageSize(newSize)
  }}
  
  // Controlled Sorting
  controlledSorting={{
    sortBy: activeSortField,
    sortOrder: activeSortDirection, // 'asc' | 'desc' | null
    onSort: (field, order) => {
      setActiveSortField(field);
      setActiveSortDirection(order);
    }
  }}
  
  // Controlled Filtering
  controlledFiltering={{
    globalFilter: searchQuery,
    onGlobalFilterChange: (query) => setSearchQuery(query)
  }}
/>
```

---

## 📖 API Reference

### `TableProps<T>`

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `T[]` | **Required** | Array of objects representing the row data. |
| `columns` | `Column<T>[]` | **Required** | Array of column definitions. |
| `rowKey` | `keyof T \| ((row: T, index: number) => string \| number)` | `undefined` | Unique key for each row. |
| `loading` | `boolean` | `false` | When true, renders an animated skeleton loading state. |
| `loadingElement` | `React.ReactNode` | `undefined` | Custom React skeleton loader to override default. |
| `emptyState` | `React.ReactNode` | `undefined` | Custom element to render when the table is empty. |
| `actions` | `RowAction<T>[]` | `undefined` | Custom row operations (e.g. edit, delete actions). |
| `actionsHeader` | `string` | `"Actions"` | Custom header label for the Actions column. |
| `actionsLayout` | `"inline" \| "dropdown"` | `"inline"` | Whether to display buttons next to each other or inside a menu. |
| `theme` | `"light" \| "dark" \| "auto"` | `"light"` | Layout palette theme. `"auto"` syncs with system media preference. |
| `responsiveCards` | `boolean` | `true` | When true, collapses rows into cards on screen sizes under 768px. |
| `classNames` | `TableClassNames` | `{}` | Custom Tailwind classes to override individual table tags. |
| `pagination` | `boolean` | `true` | Enable client-side pagination. |
| `defaultPageSize` | `number` | `10` | Default number of records per page. |
| `pageSizeOptions` | `number[]` | `[5, 10, 20, 50]` | Dropdown page size selections. |
| `globalFilter` | `boolean` | `true` | Enable global searching input. |
| `columnFilters` | `boolean` | `false` | Enable input fields for individual columns. |

---

### `Column<T>`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `key` | `string` | **Required** | Access key of the row object. Supports nested dot notation (e.g. `details.address.zip`). |
| `header` | `React.ReactNode` | **Required** | Header label or React node. |
| `sortable` | `boolean` | `false` | Allow sorting by clicking the header. |
| `filterable` | `boolean` | `false` | Enable text input filtering for this column. |
| `dataType` | `"string" \| "number" \| "date" \| "boolean"` | `"string"` | Data type used for logical alphanumeric or chronological sorting. |
| `render` | `(value: any, row: T, index: number) => React.ReactNode` | `undefined` | Custom renderer callback for cells in this column. |
| `sortType` | `(a: any, b: any) => number` | `undefined` | Custom sorting comparator. |
| `headerClassName` | `string` | `""` | Custom Tailwind classes to style this header cell. |
| `cellClassName` | `string` | `""` | Custom Tailwind classes to style these cells. |

---

### `TableClassNames`

Inject custom styles into the component using the `classNames` option. Available selectors:

```typescript
export interface TableClassNames {
  wrapper?: string;               // Main container block
  table?: string;                 // Table HTML element
  thead?: string;                 // Table head element
  th?: string;                    // Table header cell element
  tbody?: string;                 // Table body element
  trRow?: string;                 // Body row element
  td?: string;                    // Body cell element
  pagination?: string;            // Footer block wrapper
  paginationButton?: string;      // Page buttons
  globalFilterWrapper?: string;   // Search container
  globalFilterInput?: string;     // Search input text field
  columnFiltersWrapper?: string;  // Column filter row
  columnFilterInput?: string;     // Column filter input field
  actionsWrapper?: string;        // Actions block container
  actionsButton?: string;         // Actions buttons
}
```

---

## 🧱 Local Development & Scripts

Inside the project directory, you can run the following:

- **Run Dev Server** (for viewing the dashboard demo):
  ```bash
  npm run dev
  ```
- **Execute Unit Test Suite** (via Vitest & Testing Library):
  ```bash
  npm run test
  ```
- **Build Demo Application**:
  ```bash
  npm run build
  ```
- **Package the Library for NPM** (generates UMD/ESM files and TS declarations in `dist/`):
  ```bash
  npm run build:lib
  ```

---

## 🚀 Publishing to NPM

1. Compile the library assets and declaration files:
   ```bash
   npm run build:lib
   ```
2. Log in to your npm registry profile:
   ```bash
   npm login
   ```
3. Publish the compiled `dist/` package (pass `--access public` as it is a scoped package):
   ```bash
   npm publish --access public
   ```

---

## 📄 License

Dedicated to the public domain under the [Unlicense](file:///home/nemo/Desktop/Table_Package/LICENSE). Feel free to use, copy, modify, or distribute.
