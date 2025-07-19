import {
  createLoader,
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import { startTransition } from "react";

export const searchParams = {
  page: parseAsInteger.withDefault(1).withOptions({
    shallow: false,
  }),
  q: parseAsString.withDefault("").withOptions({
    shallow: false,
    startTransition,
  }),
  sort: parseAsString.withOptions({
    shallow: false,
    startTransition,
  }),
  dir: parseAsString.withOptions({
    shallow: false,
    startTransition,
  }),
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const loadSearchParams = createLoader(searchParams);

// Constants for pagination
export const ITEMS_PER_PAGE = 12;
export function getTotalPages(totalItems: number) {
  return Math.ceil(totalItems / ITEMS_PER_PAGE);
}
