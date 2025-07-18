import {
  createLoader,
  createSearchParamsCache,
  parseAsInteger,
} from 'nuqs/server';

export const searchParams = {
  page: parseAsInteger.withDefault(1).withOptions({
    shallow: false,
  }),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const loadSearchParams = createLoader(searchParams);

// Constants for pagination
export const ITEMS_PER_PAGE = 12;
export function getTotalPages(totalItems: number) {
  return Math.ceil(totalItems / ITEMS_PER_PAGE);
}