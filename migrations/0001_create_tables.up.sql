-- Create categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug varchar(191) NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  color_variant varchar(50) DEFAULT 'gray',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  slug varchar(191) NOT NULL,
  title varchar(255) NOT NULL,
  content text NOT NULL,
  excerpt text,
  cover_image_url varchar(2048),
  is_published boolean NOT NULL DEFAULT false,
  word_count integer NOT NULL DEFAULT 0,
  reading_time integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create post_categories junction table
CREATE TABLE IF NOT EXISTS post_categories (
  post_id integer NOT NULL,
  category_id integer NOT NULL,
  CONSTRAINT fk_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);

-- Composite PK for post_categories
ALTER TABLE post_categories
  ADD CONSTRAINT pk_post_categories PRIMARY KEY (post_id, category_id);
