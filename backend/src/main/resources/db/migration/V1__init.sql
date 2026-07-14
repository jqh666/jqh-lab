-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. blog_categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content_md TEXT NOT NULL,
    category_id BIGINT REFERENCES blog_categories(id),
    tags TEXT,
    status VARCHAR(20) DEFAULT 'published',
    cover_image VARCHAR(500),
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. projects
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    tech_stack TEXT,
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    cover_image VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. portfolio_items
CREATE TABLE IF NOT EXISTS portfolio_items (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    images TEXT,
    demo_url VARCHAR(500),
    category VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. knowledge_docs
CREATE TABLE IF NOT EXISTS knowledge_docs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200),
    source VARCHAR(50),
    content TEXT NOT NULL,
    embedding VECTOR(1024),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create vector index
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_embedding ON knowledge_docs
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Insert default categories
INSERT INTO blog_categories (name, slug, sort_order) VALUES
    ('技术', 'tech', 1),
    ('生活', 'life', 2),
    ('成长', 'growth', 3),
    ('碎碎念', 'random', 4)
ON CONFLICT (name) DO NOTHING;
