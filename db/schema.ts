import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    orderNumber: text("order_number").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    status: text("status").notNull().default("confirmed"),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("INR"),
    itemsJson: text("items_json").notNull(),
    trackingCode: text("tracking_code"),
    cancelledAt: integer("cancelled_at", { mode: "timestamp_ms" }),
  },
  (table) => [index("idx_orders_user_created").on(table.userId, table.createdAt)],
);
