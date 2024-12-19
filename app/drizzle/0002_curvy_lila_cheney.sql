PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_survey` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`user_id` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_survey`("id", "created_at", "updated_at", "title", "description", "user_id") SELECT "id", "created_at", "updated_at", "title", "description", "user_id" FROM `survey`;--> statement-breakpoint
DROP TABLE `survey`;--> statement-breakpoint
ALTER TABLE `__new_survey` RENAME TO `survey`;--> statement-breakpoint
PRAGMA foreign_keys=ON;