CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`order_number` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`total_cents` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`items_json` text NOT NULL,
	`tracking_code` text,
	`cancelled_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `idx_orders_user_created` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
PRAGMA optimize;
