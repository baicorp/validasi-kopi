ALTER TABLE `submission_attemps` RENAME TO `submission_attempts`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_submission_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`number_attemp` integer NOT NULL,
	`grade` integer NOT NULL,
	`retake_exam` text,
	`exam_id` text NOT NULL,
	`user_id` text NOT NULL,
	`exam_event_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exam_event_id`) REFERENCES `exam_events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_submission_attempts`("id", "number_attemp", "grade", "retake_exam", "exam_id", "user_id", "exam_event_id", "created_at", "updated_at") SELECT "id", "number_attemp", "grade", "retake_exam", "exam_id", "user_id", "exam_event_id", "created_at", "updated_at" FROM `submission_attempts`;--> statement-breakpoint
DROP TABLE `submission_attempts`;--> statement-breakpoint
ALTER TABLE `__new_submission_attempts` RENAME TO `submission_attempts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_exam_submission_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`note` text NOT NULL,
	`submission_attempt_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`submission_attempt_id`) REFERENCES `submission_attempts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_exam_submission_notes`("id", "note", "submission_attempt_id", "created_at", "updated_at") SELECT "id", "note", "submission_attempt_id", "created_at", "updated_at" FROM `exam_submission_notes`;--> statement-breakpoint
DROP TABLE `exam_submission_notes`;--> statement-breakpoint
ALTER TABLE `__new_exam_submission_notes` RENAME TO `exam_submission_notes`;--> statement-breakpoint
CREATE TABLE `__new_exam_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`value` text NOT NULL,
	`additional_value` text,
	`result` text NOT NULL,
	`submission_attempt_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`submission_attempt_id`) REFERENCES `submission_attempts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_exam_submissions`("id", "code", "value", "additional_value", "result", "submission_attempt_id", "created_at", "updated_at") SELECT "id", "code", "value", "additional_value", "result", "submission_attempt_id", "created_at", "updated_at" FROM `exam_submissions`;--> statement-breakpoint
DROP TABLE `exam_submissions`;--> statement-breakpoint
ALTER TABLE `__new_exam_submissions` RENAME TO `exam_submissions`;