import { useState, useMemo } from 'react';
import { Table } from './lib';
import type { Column, RowAction } from './lib/types';
import './App.css';

interface Employee {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  age: number;
  salary: number;
  joinedDate: string;
}

const initialEmployees: Employee[] = [
  { id: 1, name: 'Sarah Connor', email: 'sarah.c@skytech.io', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'Engineering Lead', department: 'Engineering', status: 'Active', age: 34, salary: 125000, joinedDate: '2021-03-12' },
  { id: 2, name: 'John Miller', email: 'j.miller@skytech.io', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'Senior Developer', department: 'Engineering', status: 'Active', age: 29, salary: 98000, joinedDate: '2022-06-18' },
  { id: 3, name: 'Elena Rostova', email: 'e.rostova@skytech.io', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'Lead UX Designer', department: 'Design', status: 'Active', age: 27, salary: 88000, joinedDate: '2023-01-10' },
  { id: 4, name: 'Marcus Aurelius', email: 'marcus.a@skytech.io', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', role: 'Product Manager', department: 'Product', status: 'Active', age: 41, salary: 115000, joinedDate: '2020-11-05' },
  { id: 5, name: 'Linda Watson', email: 'linda.w@skytech.io', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', role: 'QA Automation Engineer', department: 'Engineering', status: 'Inactive', age: 26, salary: 72000, joinedDate: '2023-09-15' },
  { id: 6, name: 'David Vance', email: 'david.v@skytech.io', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', role: 'Marketing Director', department: 'Marketing', status: 'Active', age: 38, salary: 105000, joinedDate: '2021-08-22' },
  { id: 7, name: 'Nisha Patel', email: 'nisha.p@skytech.io', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role: 'HR Operations', department: 'Human Resources', status: 'Active', age: 31, salary: 68000, joinedDate: '2022-10-01' },
  { id: 8, name: 'Arthur Dent', email: 'arthur.d@skytech.io', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'Support Specialist', department: 'Operations', status: 'Inactive', age: 42, salary: 60000, joinedDate: '2019-05-24' }
];

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showColFilters, setShowColFilters] = useState<boolean>(false);
  const [actionsLayout, setActionsLayout] = useState<'inline' | 'dropdown'>('inline');
  const [responsiveCards, setResponsiveCards] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<'install' | 'usage' | 'api' | 'controlled' | 'styling'>('install');
  const [copied, setCopied] = useState<boolean>(false);

  // Toast Trigger Helper
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Copy npm command helper
  const handleCopy = () => {
    navigator.clipboard.writeText('npm install @ohryzon/react-tablez');
    setCopied(true);
    triggerToast('Copied npm install command to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Metrics summary calculations
  const metrics = useMemo(() => {
    const activeCount = employees.filter((e) => e.status === 'Active').length;
    const totalSalary = employees.reduce((acc, e) => acc + e.salary, 0);
    const avgAge = Math.round(employees.reduce((acc, e) => acc + e.age, 0) / (employees.length || 1));
    return {
      activeCount,
      totalSalary,
      avgAge,
      totalCount: employees.length
    };
  }, [employees]);

  // Table actions configuration
  const tableActions: RowAction<Employee>[] = [
    {
      name: 'edit',
      label: 'Edit',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      onClick: (row) => triggerToast(`Edit trigger for employee: ${row.name}`, 'info'),
      className: 'text-slate-650 hover:text-indigo-650 hover:border-slate-300 dark:hover:text-indigo-400'
    },
    {
      name: 'toggle-status',
      label: 'Toggle Status',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: (row) => {
        const nextStatus = row.status === 'Active' ? 'Inactive' : 'Active';
        setEmployees((prev) =>
          prev.map((e) => (e.id === row.id ? { ...e, status: nextStatus } : e))
        );
        triggerToast(`Updated status of ${row.name} to ${nextStatus}`, 'success');
      },
      className: 'text-slate-650 hover:text-emerald-650 hover:border-slate-300 dark:hover:text-emerald-400'
    },
    {
      name: 'delete',
      label: 'Delete',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: (row) => {
        setEmployees((prev) => prev.filter((e) => e.id !== row.id));
        triggerToast(`Removed employee entry: ${row.name}`, 'error');
      },
      className: 'text-slate-650 hover:text-rose-650 hover:border-slate-300 dark:hover:text-rose-450'
    }
  ];

  // Column settings
  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee Name',
      sortable: true,
      filterable: true,
      dataType: 'string',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div>
            <div className="font-semibold text-slate-800 leading-tight">
              {row.name}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {row.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      filterable: true,
      dataType: 'string',
      render: (val, row) => (
        <div>
          <div className="font-semibold text-slate-700">{val}</div>
          <div className="text-xs text-slate-500">{row.department}</div>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      filterable: true,
      dataType: 'string',
      render: (val) => {
        const colors: Record<string, string> = {
          Engineering: 'bg-slate-100 text-slate-800 border-slate-200',
          Design: 'bg-slate-100 text-slate-800 border-slate-200',
          Product: 'bg-slate-100 text-slate-800 border-slate-200',
          Marketing: 'bg-slate-100 text-slate-800 border-slate-200',
          'Human Resources': 'bg-slate-100 text-slate-800 border-slate-200',
          Operations: 'bg-slate-100 text-slate-800 border-slate-200'
        };
        const colorClass = colors[val] || 'bg-slate-100 text-slate-800 border-slate-200';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
            {val}
          </span>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      dataType: 'string',
      render: (val) => {
        const isActive = val === 'Active';
        return (
          <span className={`
            inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border
            ${isActive 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
              : 'bg-slate-50 text-slate-500 border-slate-200'
            }
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            {val}
          </span>
        );
      }
    },
    {
      key: 'age',
      header: 'Age',
      sortable: true,
      filterable: true,
      dataType: 'number',
      cellClassName: 'font-medium text-slate-700'
    },
    {
      key: 'salary',
      header: 'Salary',
      sortable: true,
      filterable: true,
      dataType: 'number',
      cellClassName: 'font-semibold text-slate-700',
      render: (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
    },
    {
      key: 'joinedDate',
      header: 'Joined',
      sortable: true,
      dataType: 'date',
      cellClassName: 'text-slate-500',
      render: (val) => new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* --- Top Navbar --- */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              @ohryzon/react-tablez
            </span>
            <span className="hidden sm:inline px-2.5 py-0.5 rounded bg-slate-100 text-xs font-semibold text-slate-650 border border-slate-200">
              v1.0.0
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#live-demo" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Live Demo</a>
            <a href="#documentation" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Documentation</a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">
            Lightweight, Premium React Data Tables
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto mb-8">
            An ultra-clean grid table package engineered for React 19 and Tailwind CSS v4. Easily manage pagination, sorting, filtering, row callbacks, and custom cell renders.
          </p>

          {/* Copyable NPM Command Badge */}
          <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5 max-w-md mx-auto select-all cursor-pointer hover:bg-slate-100 transition-colors" onClick={handleCopy}>
            <span className="font-mono text-xs text-indigo-650 font-bold px-1.5">
              npm install @ohryzon/react-tablez
            </span>
            <button 
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 transition-colors" 
              aria-label="Copy package command"
            >
              {copied ? (
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* --- Live Interactive Demonstration --- */}
      <section id="live-demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-slate-900">Interactive Preview</h2>
            <p className="text-sm text-slate-500 mt-1">Try sorting headers, searching data, or testing the inline controls.</p>
          </div>

          {/* Config Controls */}
          <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showColFilters}
                onChange={(e) => {
                  setShowColFilters(e.target.checked);
                  triggerToast(`Column specific filters ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
                }}
                className="w-4 h-4 rounded text-indigo-650 border-slate-350 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-600">Column Filters</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={responsiveCards}
                onChange={(e) => {
                  setResponsiveCards(e.target.checked);
                  triggerToast(`Mobile layouts ${e.target.checked ? 'active' : 'inactive'}`, 'info');
                }}
                className="w-4 h-4 rounded text-indigo-650 border-slate-350 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-600">Responsive Cards</span>
            </label>

            <div className="h-4 w-px bg-slate-200"></div>

            <button
              onClick={() => {
                setActionsLayout(actionsLayout === 'inline' ? 'dropdown' : 'inline');
                triggerToast(`Actions layout set to ${actionsLayout === 'inline' ? 'dropdown' : 'inline'}`, 'info');
              }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-md font-semibold text-slate-650 bg-white hover:bg-slate-50 transition-colors"
            >
              Layout: {actionsLayout === 'inline' ? 'Inline' : 'Dropdown'}
            </button>

            <button
              onClick={() => {
                setEmployees(initialEmployees);
                triggerToast('Employee records reset to initial state', 'success');
              }}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-md font-semibold text-slate-650 bg-white hover:bg-slate-50 transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>

        {/* Table Render Wrapper */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
          <Table<Employee>
            data={employees}
            columns={columns}
            actions={tableActions}
            actionsLayout={actionsLayout}
            theme="light"
            columnFilters={showColFilters}
            responsiveCards={responsiveCards}
            pagination={true}
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 25]}
            rowKey="id"
          />
        </div>
      </section>

      {/* --- Key Metrics Summary (Light/Flat Theme) --- */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center md:text-left">
            <div className="text-3xl font-extrabold text-slate-900">{metrics.totalCount}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Total Employees</div>
          </div>
          <div className="text-center md:text-left border-l border-slate-200 pl-0 md:pl-8">
            <div className="text-3xl font-extrabold text-slate-900">{metrics.activeCount}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Active Status</div>
          </div>
          <div className="text-center md:text-left border-l border-slate-200 pl-0 md:pl-8">
            <div className="text-3xl font-extrabold text-slate-900">{metrics.avgAge} yrs</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Average Age</div>
          </div>
          <div className="text-center md:text-left border-l border-slate-200 pl-0 md:pl-8">
            <div className="text-3xl font-extrabold text-slate-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(metrics.totalSalary)}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Total Payroll</div>
          </div>
        </div>
      </section>

      {/* --- Robust Documentation Section --- */}
      <section id="documentation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-left mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Technical Documentation</h2>
          <p className="text-sm text-slate-500 mt-1">A robust reference manual on properties, configurations, and state handling.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Documentation Tabs Navigation */}
          <div className="w-full lg:w-1/4 flex flex-col gap-1 border-l border-slate-200">
            {[
              { id: 'install', label: '1. Installation' },
              { id: 'usage', label: '2. Basic Usage' },
              { id: 'api', label: '3. API Reference' },
              { id: 'controlled', label: '4. Server-Side (Controlled)' },
              { id: 'styling', label: '5. Tailwind Overrides' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  text-left px-4 py-2 text-sm font-semibold transition-all -ml-px border-l-2
                  ${activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Documentation Panels Content */}
          <div className="w-full lg:w-3/4 bg-white border border-slate-200 rounded-xl p-6 md:p-8 text-left shadow-sm min-h-[400px]">
            
            {activeTab === 'install' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Installation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Install `@ohryzon/react-tablez` in your project via NPM or any choice of package manager. The package exports ESM modules, CommonJS modules, and fully typed TypeScript definitions.
                </p>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Using NPM</div>
                  <code className="block bg-slate-50 p-3 rounded-lg border border-slate-250 font-mono text-xs text-indigo-650 select-all">
                    npm install @ohryzon/react-tablez
                  </code>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Using Yarn</div>
                  <code className="block bg-slate-50 p-3 rounded-lg border border-slate-250 font-mono text-xs text-indigo-650 select-all">
                    yarn add @ohryzon/react-tablez
                  </code>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Using PNPM</div>
                  <code className="block bg-slate-50 p-3 rounded-lg border border-slate-250 font-mono text-xs text-indigo-650 select-all">
                    pnpm add @ohryzon/react-tablez
                  </code>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Basic Usage</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  To get started, define your data structure array and the column keys mapping. React-Tablez automatically handles uncontrolled sorting, pagination, and searching filters.
                </p>
                <pre className="block bg-slate-900 p-4 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto">
{`import React from 'react';
import { Table, Column } from '@ohryzon/react-tablez';

interface User {
  id: number;
  name: string;
  role: string;
}

const columns: Column<User>[] = [
  { key: 'name', header: 'User Name', sortable: true, filterable: true },
  { key: 'role', header: 'Role Position', sortable: true }
];

const users: User[] = [
  { id: 1, name: 'Alice Smith', role: 'Software Engineer' },
  { id: 2, name: 'Bob Johnson', role: 'Product Lead' }
];

export default function MyDashboard() {
  return (
    <Table<User>
      data={users}
      columns={columns}
      pagination={true}
      defaultPageSize={10}
      globalFilter={true}
    />
  );
}`}
                </pre>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">TableProps Configuration</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-left">
                          <th className="px-4 py-2">Prop</th>
                          <th className="px-4 py-2">Type</th>
                          <th className="px-4 py-2">Default</th>
                          <th className="px-4 py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        <tr>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">data</td>
                          <td className="px-4 py-2"><code>{"T[]"}</code></td>
                          <td className="px-4 py-2 font-mono">required</td>
                          <td className="px-4 py-2">The array containing the data rows to display.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">columns</td>
                          <td className="px-4 py-2"><code>{"Column<T>[]"}</code></td>
                          <td className="px-4 py-2 font-mono">required</td>
                          <td className="px-4 py-2">List of column configuration structures.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">actions</td>
                          <td className="px-4 py-2"><code>{"RowAction<T>[]"}</code></td>
                          <td className="px-4 py-2 font-mono">undefined</td>
                          <td className="px-4 py-2">Callbacks defining row buttons like Edit or Delete.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">theme</td>
                          <td className="px-4 py-2"><code>{"'light' | 'dark' | 'auto'"}</code></td>
                          <td className="px-4 py-2 font-mono">'light'</td>
                          <td className="px-4 py-2">Visual palette mode of the container.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">pagination</td>
                          <td className="px-4 py-2"><code>{"boolean"}</code></td>
                          <td className="px-4 py-2 font-mono">true</td>
                          <td className="px-4 py-2">Enables internal pagination logic.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Column Options</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-left">
                          <th className="px-4 py-2">Option</th>
                          <th className="px-4 py-2">Type</th>
                          <th className="px-4 py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        <tr>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">key</td>
                          <td className="px-4 py-2"><code>{"string"}</code></td>
                          <td className="px-4 py-2">Unique object key. Can reference nested paths (e.g. `user.address.zip`).</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">sortable</td>
                          <td className="px-4 py-2"><code>{"boolean"}</code></td>
                          <td className="px-4 py-2">Clicking column header will sort rows ASC/DESC/Neutral.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">dataType</td>
                          <td className="px-4 py-2"><code>{"'string' | 'number' | 'date' | 'boolean'"}</code></td>
                          <td className="px-4 py-2">Helps natural sorters handle numbers and chronologies.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-mono font-bold text-slate-800">render</td>
                          <td className="px-4 py-2"><code>{"(val, row, idx) => ReactNode"}</code></td>
                          <td className="px-4 py-2">Custom renderer hook to embed links, HTML, tags.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'controlled' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Server-Side Integration</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  If you load data dynamically from a REST API or database backend on page/sort changes, bypass the internal component state by providing `controlled` parameters:
                </p>
                <pre className="block bg-slate-900 p-4 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto">
{`<Table<User>
  data={dbData}
  columns={columns}
  
  controlledPagination={{
    currentPage: pageNum,
    pageSize: sizeLimit,
    totalItems: totalDBRows,
    onPageChange: (newPage) => fetchPage(newPage),
    onPageSizeChange: (newLimit) => fetchWithLimit(newLimit)
  }}
  
  controlledSorting={{
    sortBy: sortField,
    sortOrder: sortDir, // 'asc' | 'desc' | null
    onSort: (field, direction) => queryServerSorted(field, direction)
  }}
/>`}
                </pre>
              </div>
            )}

            {activeTab === 'styling' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Tailwind Styling Customization</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  React-Tablez renders standard semantic table tags with minimal flat styling classes. You can override or inject styling properties using the `classNames` property:
                </p>
                <pre className="block bg-slate-900 p-4 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto">
{`<Table
  data={data}
  columns={columns}
  classNames={{
    wrapper: "border-slate-300 shadow-none rounded-none",
    th: "bg-slate-100 text-slate-800 font-extrabold text-sm",
    td: "py-3 text-slate-700 font-medium border-b border-slate-100",
    trRow: "hover:bg-indigo-50/20"
  }}
/>`}
                </pre>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
        @ohryzon/react-tablez © 2026. Made with ❤️ for modern React developers.
      </footer>

      {/* --- Toast Drawers --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80 pointer-events-none">
        {toasts.map((toast) => {
          const typeColors = {
            success: 'bg-white border-emerald-300 text-emerald-800 shadow-sm',
            info: 'bg-white border-indigo-300 text-indigo-850 shadow-sm',
            error: 'bg-white border-rose-300 text-rose-800 shadow-sm'
          };
          return (
            <div
              key={toast.id}
              className={`
                p-4 border rounded-xl flex items-center gap-3 text-xs font-semibold
                animate-slide-up pointer-events-auto transition-all duration-300
                ${typeColors[toast.type]}
              `}
            >
              <span>
                {toast.type === 'success' && (
                  <svg className="w-4 h-4 text-emerald-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'info' && (
                  <svg className="w-4 h-4 text-indigo-550" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </span>
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default App;
