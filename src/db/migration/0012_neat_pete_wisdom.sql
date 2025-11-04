PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_exam_registrations` (
	`id` integer PRIMARY KEY NOT NULL,
	`selected_exam` text NOT NULL,
	`user_id` text NOT NULL,
	`exam_event_id` integer NOT NULL,
	`code_group_id` integer,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_event_id`) REFERENCES `exam_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`code_group_id`) REFERENCES `code_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_exam_registrations`("id", "selected_exam", "user_id", "exam_event_id", "code_group_id", "created_at", "updated_at") SELECT "id", "selected_exam", "user_id", "exam_event_id", "code_group_id", "created_at", "updated_at" FROM `exam_registrations`;--> statement-breakpoint
DROP TABLE `exam_registrations`;--> statement-breakpoint
ALTER TABLE `__new_exam_registrations` RENAME TO `exam_registrations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_exam_submissions` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`value` text NOT NULL,
	`user_id` text NOT NULL,
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
INSERT INTO `__new_exam_submissions`("id", "code", "value", "user_id", "exam_id", "exam_event_id", "code_group_id", "created_at", "updated_at") SELECT "id", "code", "value", "user_id", "exam_id", "exam_event_id", "code_group_id", "created_at", "updated_at" FROM `exam_submissions`;--> statement-breakpoint
DROP TABLE `exam_submissions`;--> statement-breakpoint
ALTER TABLE `__new_exam_submissions` RENAME TO `exam_submissions`;