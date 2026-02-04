-- MySQL schema for story project
-- MySQL 8.x recommended
-- Charset: utf8mb4 for Chinese text

-- Notes
-- - Novel primary key strategy (confirmed): dataset-first
--   novels.source_book_id BIGINT UNSIGNED is the canonical novel id in MySQL.
-- - UUID storage strategy (confirmed): CHAR(36)
--   UUID columns use ASCII charset/collation for compactness and predictable comparisons.

CREATE TABLE IF NOT EXISTS novels (
  source_book_id BIGINT UNSIGNED NOT NULL,

  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  subcategory VARCHAR(64) NULL,

  intro TEXT NOT NULL,
  tags_json JSON NULL,

  favorites_count INT UNSIGNED NOT NULL DEFAULT 0,
  views_proxy INT UNSIGNED NOT NULL DEFAULT 0,
  word_count INT UNSIGNED NOT NULL DEFAULT 0,

  status VARCHAR(16) NOT NULL DEFAULT 'published',
  updated_at DATETIME NULL,

  -- Runtime metrics maintained by the application
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  avg_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Optional metrics from the ranking/first-day sheets
  first_day_v INT UNSIGNED NULL,
  first_day_favorites INT UNSIGNED NULL,
  first_day_flowers INT UNSIGNED NULL,
  first_day_reward INT UNSIGNED NULL,
  first_day_rating INT UNSIGNED NULL,
  first_day_reviews INT UNSIGNED NULL,
  first_day_words_k DECIMAL(10,2) NULL,

  best_rank INT UNSIGNED NULL,
  worst_rank INT UNSIGNED NULL,
  total_times INT UNSIGNED NULL,

  PRIMARY KEY (source_book_id),

  -- Common search/filter indexes
  KEY idx_title (title),
  KEY idx_author (author),
  KEY idx_category (category),
  KEY idx_subcategory (subcategory),
  KEY idx_status_updated (status, updated_at),
  KEY idx_favorites (favorites_count),
  KEY idx_views (views_proxy)

  -- Optional (MySQL 5.7+/8.0): FULLTEXT for keyword search
  -- ,FULLTEXT KEY ft_title_author_intro (title, author, intro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Users
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,

  email VARCHAR(254) NOT NULL,
  username VARCHAR(64) NOT NULL,
  display_name VARCHAR(64) NOT NULL,
  avatar_url VARCHAR(2048) NULL,
  bio TEXT NULL,

  role VARCHAR(16) NOT NULL DEFAULT 'user',
  status VARCHAR(32) NOT NULL DEFAULT 'active',

  password_hash VARCHAR(128) NOT NULL,
  last_login DATETIME NULL,
  is_staff TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_superuser TINYINT(1) NOT NULL DEFAULT 0,
  date_joined DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_username (username),
  KEY idx_users_role_status (role, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Favorites (soft delete by deleted_at)
CREATE TABLE IF NOT EXISTS favorites (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  novel_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_favorites_user_novel (user_id, novel_id),
  KEY idx_favorites_user_deleted (user_id, deleted_at),
  KEY idx_favorites_novel_deleted (novel_id, deleted_at),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_novel FOREIGN KEY (novel_id) REFERENCES novels (source_book_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Ratings (one per user+novel, overwritable)
CREATE TABLE IF NOT EXISTS ratings (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  novel_id BIGINT UNSIGNED NOT NULL,
  score SMALLINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_ratings_user_novel (user_id, novel_id),
  KEY idx_ratings_novel (novel_id),
  CONSTRAINT ck_ratings_score CHECK (score >= 1 AND score <= 5),
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_novel FOREIGN KEY (novel_id) REFERENCES novels (source_book_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Comments (threading via parent_id; soft delete via deleted flag)
CREATE TABLE IF NOT EXISTS comments (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  novel_id BIGINT UNSIGNED NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  user_display_name VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  parent_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted TINYINT(1) NOT NULL DEFAULT 0,

  PRIMARY KEY (id),
  KEY idx_comments_novel_created (novel_id, created_at),
  KEY idx_comments_parent_created (parent_id, created_at),
  CONSTRAINT fk_comments_novel FOREIGN KEY (novel_id) REFERENCES novels (source_book_id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Analytics events
CREATE TABLE IF NOT EXISTS login_events (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_login_events_created (created_at),
  KEY idx_login_events_user_created (user_id, created_at),
  CONSTRAINT fk_login_events_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS search_events (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NULL,
  `query` JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_search_events_created (created_at),
  KEY idx_search_events_user_created (user_id, created_at),
  CONSTRAINT fk_search_events_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS novel_view_events (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NULL,
  novel_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_novel_view_events_created (created_at),
  KEY idx_novel_view_events_novel_created (novel_id, created_at),
  KEY idx_novel_view_events_user_created (user_id, created_at),
  CONSTRAINT fk_novel_view_events_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_novel_view_events_novel FOREIGN KEY (novel_id) REFERENCES novels (source_book_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
