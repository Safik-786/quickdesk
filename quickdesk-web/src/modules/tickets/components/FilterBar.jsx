
import Input from '../../core/components/ui/Input';
import Dropdown from '../../core/components/ui/Dropdown';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const searchIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function FilterBar({ filters, setFilters }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <Input
          type="text"
          placeholder="Search tickets..."
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          iconLeft={searchIcon}
        />
      </div>
      
      <div className="w-48">
        <Dropdown
          value={filters.status || ''}
          onChange={(val) => setFilters({ ...filters, status: val })}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
        />
      </div>
    </div>
  );
}
