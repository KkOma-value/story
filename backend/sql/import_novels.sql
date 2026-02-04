LOAD DATA LOCAL INFILE 'D:/JavaCode/story/backend/sql/novels_mysql.csv'
REPLACE
INTO TABLE novels
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(source_book_id,title,author,category,subcategory,intro,tags_json,favorites_count,views_proxy,word_count,status,@updated_at,@first_day_v,@first_day_favorites,@first_day_flowers,@first_day_reward,@first_day_rating,@first_day_reviews,@first_day_words_k,@best_rank,@worst_rank,@total_times)
SET 
  updated_at = NULLIF(@updated_at, ''),
  first_day_v = NULLIF(@first_day_v, ''),
  first_day_favorites = NULLIF(@first_day_favorites, ''),
  first_day_flowers = NULLIF(@first_day_flowers, ''),
  first_day_reward = NULLIF(@first_day_reward, ''),
  first_day_rating = NULLIF(@first_day_rating, ''),
  first_day_reviews = NULLIF(@first_day_reviews, ''),
  first_day_words_k = NULLIF(@first_day_words_k, ''),
  best_rank = NULLIF(@best_rank, ''),
  worst_rank = NULLIF(@worst_rank, ''),
  total_times = NULLIF(@total_times, '');


