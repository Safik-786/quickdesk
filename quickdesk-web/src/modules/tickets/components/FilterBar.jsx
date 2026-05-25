import { useState } from 'react';
import { MdFilterListAlt } from 'react-icons/md';
import { CiSearch } from 'react-icons/ci';

import Input from '../../core/components/ui/Input';
import Dropdown from '../../core/components/ui/Dropdown';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const searchIcon = <CiSearch className="h-5 w-5" />;

export default function FilterBar({
  filters,
  setFilters,
  viewType = 'card',
  setViewType,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="p-1 px-2 bg-blue-50 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-center justify-between">
      
      {/* Search + Mobile Filter */}
      <div className="flex flex-1 items-center">
        <div className="flex-1 min-w-[10px]">
          <Input
            type="text"
            placeholder="Search tickets..."
            value={filters.search || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
                page: 1,
              })
            }
            iconLeft={searchIcon}
          />
        </div>

        {/* Mobile filter icon */}
        <div className="block md:hidden relative">
          <button
            type="button"
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition"
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Show filters"
          >
            <MdFilterListAlt className="w-5 h-5 text-blue-600" />
          </button>

          {/* Mobile filter dropdown */}
          {showFilters && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex flex-col gap-4 md:hidden min-w-[250px]">
              <Dropdown
                value={filters.status || ''}
                onChange={(val) =>
                  setFilters({
                    ...filters,
                    status: val,
                    page: 1,
                  })
                }
                options={STATUS_OPTIONS}
                buttonClassName="text-sm! py-2 w-full"
                placeholder="All Statuses"
              />

              <Input
                type="date"
                value={filters.date || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    date: e.target.value,
                    page: 1,
                  })
                }
                placeholder="Datewise filter"
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop filters */}
      <div className="hidden md:flex gap-3 items-center flex-1 justify-between">
        <div className="w-52">
          <Dropdown
            value={filters.status || ''}
            onChange={(val) =>
              setFilters({
                ...filters,
                status: val,
                page: 1,
              })
            }
            options={STATUS_OPTIONS}
            buttonClassName="text-sm! py-2"
            placeholder="All Statuses"
          />
        </div>

        <div className="w-48">
          <Input
            type="date"
            value={filters.date || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                date: e.target.value,
                page: 1,
              })
            }
            placeholder="Datewise filter"
          />
        </div>
      </div>

      {/* View toggle */}
      {setViewType && (
        <div className="flex bg-white rounded-lg p-1 shadow-sm ml-2">
          <button
            type="button"
            onClick={() => setViewType('card')}
            className={`p-1.5 cursor-pointer rounded-md transition-colors ${
              viewType === 'card'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Card View"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setViewType('table')}
            className={`p-1 rounded-md cursor-pointer transition-colors ${
              viewType === 'table'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Tabular View"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}