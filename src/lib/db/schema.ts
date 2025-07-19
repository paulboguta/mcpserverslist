import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  primaryKey,
  index,
  boolean,
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
    readmeContent: text("readme_content"),
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

// AUTH
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  serverName: varchar("server_name", { length: 255 }).notNull(),
  repoUrl: varchar("repo_url", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Type exports
export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
