CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"short_desc" varchar(160) NOT NULL,
	"long_desc" text,
	"homepage_url" varchar(255),
	"repo_url" varchar(255),
	"docs_url" varchar(255),
	"logo_url" text,
	"stars" integer DEFAULT 0,
	"last_commit" timestamp with time zone,
	"license" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "servers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "servers_to_categories" (
	"server_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "servers_to_categories_server_id_category_id_pk" PRIMARY KEY("server_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "servers_to_categories" ADD CONSTRAINT "servers_to_categories_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servers_to_categories" ADD CONSTRAINT "servers_to_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "servers_name_idx" ON "servers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "servers_slug_idx" ON "servers" USING btree ("slug");