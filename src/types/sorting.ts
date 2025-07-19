import { ReactNode } from "react";

export type SortOption<T extends string> = {
  field: T;
  direction: "asc" | "desc";
  label: string;
  icon: ReactNode;
};

export type CommonSortField = "createdAt" | "name";

export type ServerSortField = CommonSortField | "stars" | "lastCommit";
