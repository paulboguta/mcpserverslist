import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const servers = pgTable(
  "servers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    shortDesc: varchar("short_desc", { length: 160 }).notNull(),
    longDesc: text("long_desc"),
    homepageUrl: varchar("homepage_url", { length: 255 }),
    repoUrl: varchar("repo_url", { length: 255 }),
    docsUrl: varchar("docs_url", { length: 255 }),
    logoUrl: text("logo_url"),
    stars: integer("stars").default(0),
    lastCommit: timestamp("last_commit", { withTimezone: true }),
    license: varchar("license", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    nameIdx: index("servers_name_idx").on(table.name),
    slugIdx: index("servers_slug_idx").on(table.slug),
  }),
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  sortOrder: integer("sort_order").default(0),
});

export const serversToCategories = pgTable(
  "servers_to_categories",
  {
    serverId: uuid("server_id")
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.serverId, table.categoryId] }),
  }),
);

// Relations
export const serversRelations = relations(servers, ({ many }) => ({
  categories: many(serversToCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  servers: many(serversToCategories),
}));

export const serversToCategoriesRelations = relations(
  serversToCategories,
  ({ one }) => ({
    server: one(servers, {
      fields: [serversToCategories.serverId],
      references: [servers.id],
    }),
    category: one(categories, {
      fields: [serversToCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

// Type exports
export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
