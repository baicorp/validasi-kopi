CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` varchar(36) NOT NULL,
	`department_name` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_department_name_unique` UNIQUE(`department_name`)
);
--> statement-breakpoint
CREATE TABLE `plant_areas` (
	`id` varchar(36) NOT NULL,
	`plant_area_name` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `plant_areas_id` PRIMARY KEY(`id`),
	CONSTRAINT `plant_areas_plant_area_name_unique` UNIQUE(`plant_area_name`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`username` varchar(255) NOT NULL,
	`display_username` text,
	`role` text,
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` timestamp(3),
	`position` text NOT NULL,
	`department_id` text NOT NULL,
	`plant_area_id` text NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`),
	CONSTRAINT `user_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `code_groups` (
	`id` varchar(36) NOT NULL,
	`group_name` varchar(255) NOT NULL,
	`selected_exam` varchar(255) NOT NULL,
	`total_participants` int NOT NULL DEFAULT 0,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `code_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `codes` (
	`id` varchar(36) NOT NULL,
	`code` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`additional_value` varchar(255),
	`exam_id` varchar(36) NOT NULL,
	`code_group_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_events` (
	`id` varchar(36) NOT NULL,
	`exam_event_name` varchar(255) NOT NULL,
	`exam_start` timestamp NOT NULL,
	`exam_end` timestamp NOT NULL,
	`code_group_reguler_id` varchar(36) NOT NULL,
	`code_group_retake_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_registrations` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`exam_event_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_submission_notes` (
	`id` varchar(36) NOT NULL,
	`note` varchar(255) NOT NULL,
	`sub_attempt_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_submission_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_submissions` (
	`id` varchar(36) NOT NULL,
	`code` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`additional_value` varchar(255),
	`result` varchar(255) NOT NULL,
	`additional_result` varchar(255),
	`sub_attempt_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sample_exam_answer` (
	`id` varchar(36) NOT NULL,
	`value` varchar(255) NOT NULL,
	`exam_event_id` varchar(36) NOT NULL,
	`exam_name` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `sample_exam_answer_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submission_attempts` (
	`id` varchar(36) NOT NULL,
	`number_attempt` int NOT NULL,
	`grade` int NOT NULL,
	`additional_grade` int,
	`retake_exam` varchar(255),
	`exam_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`exam_event_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `submission_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_categories` (
	`id` varchar(36) NOT NULL,
	`category_name` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` varchar(36) NOT NULL,
	`exam_name` varchar(255) NOT NULL,
	`exam_category_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`id` varchar(36) NOT NULL,
	`category_name` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_categories_category_name_unique` UNIQUE(`category_name`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`product_name` varchar(255) NOT NULL,
	`product_category_id` varchar(36) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_product_name_unique` UNIQUE(`product_name`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `codes` ADD CONSTRAINT `codes_exam_id_exams_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `codes` ADD CONSTRAINT `codes_code_group_id_code_groups_id_fk` FOREIGN KEY (`code_group_id`) REFERENCES `code_groups`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_events` ADD CONSTRAINT `exam_events_code_group_reguler_id_code_groups_id_fk` FOREIGN KEY (`code_group_reguler_id`) REFERENCES `code_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_events` ADD CONSTRAINT `exam_events_code_group_retake_id_code_groups_id_fk` FOREIGN KEY (`code_group_retake_id`) REFERENCES `code_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_registrations` ADD CONSTRAINT `exam_registrations_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_registrations` ADD CONSTRAINT `exam_registrations_exam_event_id_exam_events_id_fk` FOREIGN KEY (`exam_event_id`) REFERENCES `exam_events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_submission_notes` ADD CONSTRAINT `exam_submission_notes_sub_attempt_id_submission_attempts_id_fk` FOREIGN KEY (`sub_attempt_id`) REFERENCES `submission_attempts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_submissions` ADD CONSTRAINT `exam_submissions_sub_attempt_id_submission_attempts_id_fk` FOREIGN KEY (`sub_attempt_id`) REFERENCES `submission_attempts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sample_exam_answer` ADD CONSTRAINT `sample_exam_answer_exam_event_id_exam_events_id_fk` FOREIGN KEY (`exam_event_id`) REFERENCES `exam_events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_attempts` ADD CONSTRAINT `submission_attempts_exam_id_exams_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_attempts` ADD CONSTRAINT `submission_attempts_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `submission_attempts` ADD CONSTRAINT `submission_attempts_exam_event_id_exam_events_id_fk` FOREIGN KEY (`exam_event_id`) REFERENCES `exam_events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exams` ADD CONSTRAINT `exams_exam_category_id_exam_categories_id_fk` FOREIGN KEY (`exam_category_id`) REFERENCES `exam_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_product_category_id_product_categories_id_fk` FOREIGN KEY (`product_category_id`) REFERENCES `product_categories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);