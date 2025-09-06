CREATE TABLE `walks` (
    `walk_id` BIGINT NOT NULL,
    `pet_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `distance` FLOAT NULL,
    `walk_time` INT NULL,
    `started_at` DATETIME NULL,
    `ended_at` DATETIME NULL,
    `created_at` DATETIME NULL,
    PRIMARY KEY (`walk_id`)
);

CREATE TABLE `walk_routes` (
    `route_id` BIGINT NOT NULL,
    `walk_id` BIGINT NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `recorded_at` VARCHAR(255) NULL,
    PRIMARY KEY (`route_id`)
);

----------------------------------------------------------
CREATE TABLE `pet_weight` (
    `weight_id` BIGINT NOT NULL,
    `pet_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `weight` DOUBLE NULL,
    `created_at` DATETIME NULL,
    PRIMARY KEY (`weight_id`)
);

CREATE TABLE `health_check` (
    `hc_id` BIGINT NOT NULL,
    `pet_id` BIGINT NOT NULL,
    `uid` BIGINT NOT NULL,
    `created_at` DATETIME NULL,
    `first` ENUM('Y', 'N', 'X') NULL,
    `second` ENUM('Y', 'N', 'X') NULL,
    `third` ENUM('no', 'sometimes', 'often', 'X') NULL,
    `fourth` ENUM('no', 'sometimes', 'often', 'X') NULL,
    `fifth` ENUM('Y', 'N', 'X') NULL,
    `sixth` ENUM('Y', 'N', 'X') NULL,
    `seventh` ENUM('no', 'sometimes', 'often', 'X') NULL,
    `eighth` ENUM('Y', 'N', 'X') NULL,
    `nineth` ENUM('no', 'sometimes', 'often', 'X') NULL,
    `tenth` ENUM('no', 'sometimes', 'often', 'X') NULL,
    `eleventh` ENUM('no', 'sometimes', 'often', 'X') NULL,
    `twelfth` ENUM('no', 'sometimes', 'often', 'X') NULL,
    `total` INT NULL,
    `digestive` INT NULL,
    `respiratory` INT NULL,
    `skin` INT NULL,
    `musculoskeletal` INT NULL,
    `endocrine` INT NULL,
    PRIMARY KEY (`hc_id`)
);

CREATE TABLE `diaries` (
    `diary_id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `pet_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `title` VARCHAR(100) NULL,
    `content` TEXT NULL,
    `created_at` DATETIME NULL,
    `mood` VARCHAR(50) NULL
);

CREATE TABLE `users` (
    `uid` BIGINT NOT NULL PRIMARY KEY,
    `family_id` BIGINT NOT NULL,
    `user_name` VARCHAR(100) NULL,
    `password` VARCHAR(100) NOT NULL,
    `nickname` VARCHAR(50) NULL,
    `gender` VARCHAR(10) NULL,
    `user_photo_url` VARCHAR(255) NULL
);

CREATE TABLE user_photo(
    uid BIGINT NOT NULL PRIMARY KEY,
    photo_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_diary_photo_id FOREIGN KEY (uid) REFERENCES users(uid) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `family` (
    `family_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME NULL,
    PRIMARY KEY (`family_id`)
);

CREATE TABLE `user_sessions` (
    `token` CHAR(43) NOT NULL,
    `uid` BIGINT NOT NULL,
    `issued_at` TIMESTAMP NULL,
    `expires_at` TIMESTAMP NULL,
    PRIMARY KEY (`token`)
);

CREATE TABLE `diary_tag` (
    `diary_tag_id` BIGINT NOT NULL,
    `diary_id` BIGINT NOT NULL,
    `tag` VARCHAR(50) NULL,
    PRIMARY KEY (`diary_tag_id`)
);

CREATE TABLE `gallery` (
    `gallery_id` BIGINT NOT NULL,
    `pet_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `gallery_photo` VARCHAR(255) NULL,
    `created_at` DATETIME NULL,
    PRIMARY KEY (`gallery_id`)
);

CREATE TABLE `invite_codes` (
    `invite_code_id` BIGINT NOT NULL,
    `family_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `code` VARCHAR(50) NULL,
    `created_at` DATETIME NULL,
    `expires_at` DATETIME NULL,
    `revoked_at` TIMESTAMP NULL,
    `used` BOOLEAN NULL,
    PRIMARY KEY (`invite_code_id`)
);

CREATE TABLE `diary_photo` (
    `photo_id` BIGINT NOT NULL,
    `diary_id` BIGINT NOT NULL,
    `diary_photo` VARCHAR(500) NULL,
    `original_name` VARCHAR(255) NULL,
    `created_at` DATETIME NULL,
    PRIMARY KEY (`photo_id`)
);

CREATE TABLE `pets` (
    `pet_id` BIGINT NOT NULL,
    `family_id` BIGINT NOT NULL,
    `created_by` BIGINT NOT NULL,
    `name` VARCHAR(40) NULL,
    `breed` VARCHAR(40) NULL,
    `birth` DATE NULL,
    `sex` VARCHAR(10) NULL,
    `neutered` BOOLEAN NULL,
    `notes` TEXT NULL,
    `pet_photo` VARCHAR(255) NULL,
    `condition` VARCHAR(50) NULL,
    `vaccination` DATE NULL,
    PRIMARY KEY (`pet_id`)
);
