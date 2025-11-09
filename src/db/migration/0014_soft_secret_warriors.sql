ALTER TABLE `exam_events` ADD `selected_exam` text NOT NULL;--> statement-breakpoint
ALTER TABLE `exam_registrations` DROP COLUMN `selected_exam`;