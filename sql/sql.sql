CREATE TABLE `user_discord` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discord_id` varchar(255) NOT NULL,
  `steam_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
