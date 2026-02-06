ALTER TABLE `submission_attempts` MODIFY COLUMN `grade` decimal(5,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `submission_attempts` MODIFY COLUMN `additional_grade` decimal(5,2);