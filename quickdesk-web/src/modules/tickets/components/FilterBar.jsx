
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

export default function FilterBar({ filters, setFilters, viewType = 'card', setViewType }) {
  return (
    <div className="p-2 bg-blue-50 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-3 items-center flex-1">
        <div className="flex-1 min-w-[200px]">
          <Input
            type="text"
            placeholder="Search tickets..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            iconLeft={searchIcon}
          />
        </div>

        <div className="w-48">
          <Dropdown
            value={filters.status || ''}
            onChange={(val) => setFilters({ ...filters, status: val, page: 1 })}
            options={STATUS_OPTIONS}
            buttonClassName="text-sm! py-2"
            placeholder="All Statuses"
          />
        </div>

        <div className="w-48">
          <Input
            type="date"
            value={filters.date || ''}
            onChange={(e) => setFilters({ ...filters, date: e.target.value, page: 1 })}
            placeholder="Datewise filter"
          />
        </div>
      </div>

      {setViewType && (
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewType('card')}
            className={`p-1.5 cursor-pointer rounded-md transition-colors ${viewType === 'card' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            title="Card View"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewType('table')}
            className={`p-1 rounded-md cursor-pointer transition-colors ${viewType === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            title="Tabular View"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
