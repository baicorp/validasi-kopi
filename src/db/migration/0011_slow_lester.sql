CREATE TABLE `exam_events` (
	`id` integer PRIMARY KEY NOT NULL,
	`exam_event_name` text NOT NULL,
	`registration_start` text NOT NULL,
	`registration_end` text NOT NULL,
	`exam_start` text NOT NULL,
	`exam_end` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `exam_registrations` (
	`id` integer PRIMARY KEY NOT NULL,
	`selected_exam` text NOT NULL,
	`user_id` integer NOT NULL,
	`exam_event_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_event_id`) REFERENCES `exam_events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exam_submission_notes` (
	`id` integer PRIMARY KEY NOT NULL,
	`note` text NOT NULL,
	`exam_submission_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`exam_submission_id`) REFERENCES `exam_submissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exam_submissions` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`value` text NOT NULL,
	`user_id` integer NOT NULL,
	`exam_id` integer NOT NULL,
	`exam_event_id` integer NOT NULL,
	`code_group_id` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_event_id`) REFERENCES `exam_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`code_group_id`) REFERENCES `code_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_username_unique";--> statement-breakpoint
DROP INDEX "product_categories_category_name_unique";--> statement-breakpoint
DROP INDEX "products_product_name_unique";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "username" TO "username" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_categories_category_name_unique` ON `product_categories` (`category_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_product_name_unique` ON `products` (`product_name`);