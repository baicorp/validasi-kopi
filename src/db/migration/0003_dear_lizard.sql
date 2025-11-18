CREATE TABLE `submission_attemps` (
	`id` integer PRIMARY KEY NOT NULL,
	`number_attemp` text NOT NULL,
	`grade` text NOT NULL,
	`retake_exam` text,
	`user_id` text NOT NULL,
	`exam_event_id` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_event_id`) REFERENCES `exam_events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `exam_submissions` DROP COLUMN `submissionAttemp`;