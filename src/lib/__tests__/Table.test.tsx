import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Table } from '../components/Table';
import type { Column, RowAction } from '../types';

interface TestUser {
  id: number;
  name: string;
  age: number;
  role: string;
  profile: {
    joinedDate: string;
  };
}

const testData: TestUser[] = [
  { id: 1, name: 'Alice Smith', age: 28, role: 'Developer', profile: { joinedDate: '2023-01-15' } },
  { id: 2, name: 'Bob Johnson', age: 34, role: 'Manager', profile: { joinedDate: '2022-05-10' } },
  { id: 3, name: 'Charlie Brown', age: 22, role: 'Designer', profile: { joinedDate: '2024-03-01' } },
  { id: 4, name: 'David Miller', age: 41, role: 'Director', profile: { joinedDate: '2020-11-20' } },
  { id: 5, name: 'Eva Green', age: 29, role: 'QA', profile: { joinedDate: '2023-08-11' } },
];

const testColumns: Column<TestUser>[] = [
  { key: 'name', header: 'Name', sortable: true, filterable: true, dataType: 'string' },
  { key: 'age', header: 'Age', sortable: true, filterable: true, dataType: 'number' },
  { key: 'role', header: 'Role', sortable: true },
  { 
    key: 'profile.joinedDate', 
    header: 'Joined', 
    dataType: 'date',
    render: (val) => new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  },
];

describe('Table Component', () => {
  // Test 1: Basic rendering
  it('should render the table with provided headers and data correctly', () => {
    render(<Table data={testData} columns={testColumns} pagination={false} globalFilter={false} responsiveCards={false} />);
    
    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Joined')).toBeInTheDocument();
    
    // Check rows data
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    expect(screen.getByText('41')).toBeInTheDocument(); // David's age
    expect(screen.getByText('Jan 2023')).toBeInTheDocument(); // Alice's formatted date
  });

  // Test 2: Uncontrolled Sorting
  it('should sort data when clicking on sortable column headers', () => {
    render(<Table data={testData} columns={testColumns} pagination={false} globalFilter={false} responsiveCards={false} />);

    const ageHeader = screen.getByText('Age');
    
    // Initial order of ages should match the original array
    let rowCells = screen.getAllByRole('row').slice(1); // skip header row
    expect(rowCells[0]).toHaveTextContent('Alice Smith'); // age 28
    expect(rowCells[1]).toHaveTextContent('Bob Johnson'); // age 34

    // First click: Sort Ascending
    fireEvent.click(ageHeader);
    rowCells = screen.getAllByRole('row').slice(1);
    expect(rowCells[0]).toHaveTextContent('Charlie Brown'); // age 22 (youngest)
    expect(rowCells[1]).toHaveTextContent('Alice Smith');   // age 28
    expect(rowCells[4]).toHaveTextContent('David Miller');   // age 41 (oldest)

    // Second click: Sort Descending
    fireEvent.click(ageHeader);
    rowCells = screen.getAllByRole('row').slice(1);
    expect(rowCells[0]).toHaveTextContent('David Miller');   // age 41
    expect(rowCells[4]).toHaveTextContent('Charlie Brown'); // age 22
  });

  // Test 3: Uncontrolled Global Filtering
  it('should filter rows based on global search text input', () => {
    render(<Table data={testData} columns={testColumns} pagination={false} globalFilter={true} responsiveCards={false} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

    // Type query "Developer"
    fireEvent.change(searchInput, { target: { value: 'Developer' } });
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  // Test 4: Uncontrolled Column-Specific Filtering
  it('should filter rows based on column-specific filters', () => {
    render(<Table data={testData} columns={testColumns} pagination={false} globalFilter={false} columnFilters={true} responsiveCards={false} />);

    // Since name and age are filterable: true, expect filter inputs
    const filterInputs = screen.getAllByPlaceholderText('Filter...');
    expect(filterInputs).toHaveLength(2); // Name and Age filter inputs
    
    // Let's type in the name filter
    fireEvent.change(filterInputs[0], { target: { value: 'Alice' } });
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  // Test 5: Uncontrolled Pagination
  it('should handle pagination and page size switching correctly', () => {
    render(
      <Table 
        data={testData} 
        columns={testColumns} 
        pagination={true} 
        defaultPageSize={2} 
        pageSizeOptions={[2, 5]} 
        globalFilter={false} 
        responsiveCards={false}
      />
    );

    // Initial page shows 2 entries (Alice, Bob)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 1 to 2 of 5 entries');

    // Click Next
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    expect(screen.getByText('David Miller')).toBeInTheDocument();
    expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 3 to 4 of 5 entries');

    // Change Page Size to 5
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '5' } });
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Eva Green')).toBeInTheDocument();
    expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 1 to 5 of 5 entries');
  });

  // Test 6: Actions Click Callback
  it('should trigger actions callback when action button is clicked', () => {
    const editMock = vi.fn();
    const deleteMock = vi.fn();
    
    const actions: RowAction<TestUser>[] = [
      { name: 'edit', label: 'Edit', onClick: editMock },
      { name: 'delete', label: 'Delete', onClick: deleteMock, show: (row) => row.age > 30 }
    ];

    render(<Table data={testData} columns={testColumns} actions={actions} pagination={false} globalFilter={false} responsiveCards={false} />);

    // Alice is 28, so delete action should NOT be visible, only edit
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons).toHaveLength(5); // 5 rows, so 5 edit buttons

    // Click Edit on first row (Alice)
    fireEvent.click(editButtons[0]);
    expect(editMock).toHaveBeenCalledTimes(1);
    expect(editMock).toHaveBeenCalledWith(testData[0], 0);

    // Bob is 34 (age > 30), so delete action should be visible
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2); // Bob (34) and David (41)
    fireEvent.click(deleteButtons[0]);
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toHaveBeenCalledWith(testData[1], 1);
  });

  // Test 7: Themes
  it('should apply light and dark mode classes based on theme prop', () => {
    const { container: lightContainer } = render(
      <Table data={testData} columns={testColumns} theme="light" responsiveCards={false} />
    );
    expect(lightContainer.querySelector('.light')).toBeInTheDocument();
    expect(lightContainer.querySelector('.dark')).not.toBeInTheDocument();

    const { container: darkContainer } = render(
      <Table data={testData} columns={testColumns} theme="dark" responsiveCards={false} />
    );
    expect(darkContainer.querySelector('.dark')).toBeInTheDocument();
    expect(darkContainer.querySelector('.light')).not.toBeInTheDocument();
  });

  // Test 8: Mobile Responsive Cards view rendering
  it('should render both desktop table and mobile cards when responsiveCards is true', () => {
    const { container } = render(
      <Table data={testData} columns={testColumns} pagination={false} globalFilter={false} responsiveCards={true} />
    );

    // Check table elements exist
    const tableElement = container.querySelector('table');
    expect(tableElement).toBeInTheDocument();

    // Check card list elements exist by querying for Mobile card wrapper structure
    const mobileCardsContainer = container.querySelector('.block.md\\:hidden');
    expect(mobileCardsContainer).toBeInTheDocument();

    // Verification of contents inside card view
    if (mobileCardsContainer) {
      const nameLabels = within(mobileCardsContainer as HTMLElement).getAllByText('Name');
      expect(nameLabels.length).toBe(5); // One name label for each of the 5 users
      
      const aliceName = within(mobileCardsContainer as HTMLElement).getByText('Alice Smith');
      expect(aliceName).toBeInTheDocument();
    }
  });
});
