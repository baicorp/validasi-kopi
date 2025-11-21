CREATE TABLE `sample_exam_answer` (
	`id` integer PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`exam_event_id` integer NOT NULL,
	`exam_name` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`exam_event_id`) REFERENCES `exam_events`(`id`) ON UPDATE no action ON DELETE no action
);
