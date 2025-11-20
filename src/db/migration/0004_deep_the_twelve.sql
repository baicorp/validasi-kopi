DROP INDEX "departments_department_name_unique";--> statement-breakpoint
DROP INDEX "plant_areas_plant_area_name_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_username_unique";--> statement-breakpoint
DROP INDEX "product_categories_category_name_unique";--> statement-breakpoint
DROP INDEX "products_product_name_unique";--> statement-breakpoint
ALTER TABLE `submission_attemps` ALTER COLUMN "number_attemp" TO "number_attemp" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `departments_department_name_unique` ON `departments` (`department_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `plant_areas_plant_area_name_unique` ON `plant_areas` (`plant_area_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `product_categories_category_name_unique` ON `product_categories` (`category_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_product_name_unique` ON `products` (`product_name`);--> statement-breakpoint
ALTER TABLE `submission_attemps` ALTER COLUMN "grade" TO "grade" integer NOT NULL;