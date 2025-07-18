import { ServerSortField, SortOption, CommonSortField } from '@/types/sorting';
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpAZ } from 'lucide-react';

export const DEFAULT_SORT_SERVERS: SortOption<ServerSortField> = {
  field: 'createdAt',
  direction: 'desc',
  label: 'Newest',
  icon: <ArrowDownAZ className="mr-2 h-4 w-4" />,
};

const COMMON_SORT_OPTIONS: SortOption<CommonSortField>[] = [
  {
    field: 'createdAt',
    direction: 'desc',
    label: 'Newest',
    icon: <ArrowDownAZ className="mr-2 h-4 w-4" />,
  },
  {
    field: 'name',
    direction: 'asc',
    label: 'Name (A-Z)',
    icon: <ArrowUpAZ className="mr-2 h-4 w-4" />,
  },
  {
    field: 'name',
    direction: 'desc',
    label: 'Name (Z-A)',
    icon: <ArrowDownAZ className="mr-2 h-4 w-4" />,
  },
];

export const SERVERS_SORT_OPTIONS: SortOption<ServerSortField>[] = [
  ...(COMMON_SORT_OPTIONS as SortOption<ServerSortField>[]),
  {
    field: 'stars',
    direction: 'desc',
    label: 'Most Stars',
    icon: <ArrowDownWideNarrow className="mr-2 h-4 w-4" />,
  },
  {
    field: 'lastCommit',
    direction: 'desc',
    label: 'Recent Commit',
    icon: <ArrowDownWideNarrow className="mr-2 h-4 w-4" />,
  },
];