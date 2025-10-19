-- Ensure unique indexes for slug columns used by ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
