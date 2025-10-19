-- Drop composite PK and tables (down)
ALTER TABLE IF EXISTS post_categories DROP CONSTRAINT IF EXISTS pk_post_categories;
DROP TABLE IF EXISTS post_categories;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
