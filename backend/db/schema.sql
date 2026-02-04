-- ============================================================================
-- Social IT Headless CMS - PostgreSQL Schema
-- Production-ready schema with UUID primary keys, RBAC, and content management
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Custom Types
-- ============================================================================

-- Content status enum (faster & safer than CHECK constraints)
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

-- ============================================================================
-- RBAC: Users, Roles, Permissions
-- ============================================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL, -- e.g., 'service', 'blog', 'page', 'case_study', 'user'
    action VARCHAR(50) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'publish'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-Role junction table
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- Role-Permission junction table
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- Content Types: Services, Blogs, Pages, Case Studies
-- ============================================================================

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    content JSONB, -- JSON-based sections for page builder
    featured_image_url TEXT,
    icon_url TEXT,
    status content_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    -- SEO fields
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    og_image_url TEXT,
    -- Relationships
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    published_by UUID REFERENCES users(id),
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blogs table
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content JSONB, -- JSON-based sections for page builder
    featured_image_url TEXT,
    author_id UUID NOT NULL REFERENCES users(id),
    category VARCHAR(100),
    tags TEXT[],
    status content_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    -- SEO fields
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    og_image_url TEXT,
    -- Relationships
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    published_by UUID REFERENCES users(id),
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pages table
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL, -- JSON-based sections for page builder
    template VARCHAR(100), -- Template identifier for page builder
    status content_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    -- SEO fields
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    og_image_url TEXT,
    -- Relationships
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    published_by UUID REFERENCES users(id),
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Case Studies table
CREATE TABLE case_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    client_logo_url TEXT,
    excerpt TEXT,
    challenge TEXT,
    solution TEXT,
    results TEXT,
    content JSONB, -- JSON-based sections for page builder
    featured_image_url TEXT,
    gallery_images TEXT[],
    industry VARCHAR(100),
    tags TEXT[],
    status content_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    -- SEO fields
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    og_image_url TEXT,
    -- Relationships
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    published_by UUID REFERENCES users(id),
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- RBAC indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);

-- Services indexes
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_published_at ON services(published_at);
CREATE INDEX idx_services_created_by ON services(created_by);
CREATE INDEX idx_services_published_by ON services(published_by);
CREATE INDEX idx_services_created_at ON services(created_at);
CREATE INDEX idx_services_content_gin ON services USING GIN(content); -- GIN index for JSONB queries
CREATE INDEX idx_services_is_deleted ON services(is_deleted);
-- Partial index for published content only (performance boost)
CREATE INDEX idx_services_published_only ON services(published_at) WHERE status = 'published' AND is_deleted = FALSE;

-- Blogs indexes
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_published_at ON blogs(published_at);
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_created_by ON blogs(created_by);
CREATE INDEX idx_blogs_published_by ON blogs(published_by);
CREATE INDEX idx_blogs_created_at ON blogs(created_at);
CREATE INDEX idx_blogs_content_gin ON blogs USING GIN(content); -- GIN index for JSONB queries
CREATE INDEX idx_blogs_tags_gin ON blogs USING GIN(tags); -- GIN index for array queries
CREATE INDEX idx_blogs_is_deleted ON blogs(is_deleted);
-- Partial index for published content only (performance boost)
CREATE INDEX idx_blogs_published_only ON blogs(published_at) WHERE status = 'published' AND is_deleted = FALSE;

-- Pages indexes
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_published_at ON pages(published_at);
CREATE INDEX idx_pages_template ON pages(template);
CREATE INDEX idx_pages_created_by ON pages(created_by);
CREATE INDEX idx_pages_published_by ON pages(published_by);
CREATE INDEX idx_pages_created_at ON pages(created_at);
CREATE INDEX idx_pages_content_gin ON pages USING GIN(content); -- GIN index for JSONB queries
CREATE INDEX idx_pages_is_deleted ON pages(is_deleted);
-- Partial index for published content only (performance boost)
CREATE INDEX idx_pages_published_only ON pages(published_at) WHERE status = 'published' AND is_deleted = FALSE;

-- Case Studies indexes
CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_status ON case_studies(status);
CREATE INDEX idx_case_studies_published_at ON case_studies(published_at);
CREATE INDEX idx_case_studies_industry ON case_studies(industry);
CREATE INDEX idx_case_studies_created_by ON case_studies(created_by);
CREATE INDEX idx_case_studies_published_by ON case_studies(published_by);
CREATE INDEX idx_case_studies_created_at ON case_studies(created_at);
CREATE INDEX idx_case_studies_content_gin ON case_studies USING GIN(content); -- GIN index for JSONB queries
CREATE INDEX idx_case_studies_tags_gin ON case_studies USING GIN(tags); -- GIN index for array queries
CREATE INDEX idx_case_studies_is_deleted ON case_studies(is_deleted);
-- Partial index for published content only (performance boost)
CREATE INDEX idx_case_studies_published_only ON case_studies(published_at) WHERE status = 'published' AND is_deleted = FALSE;

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts for the CMS';
COMMENT ON TABLE roles IS 'RBAC roles for access control';
COMMENT ON TABLE permissions IS 'Granular permissions for resources and actions';
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users and roles';
COMMENT ON TABLE role_permissions IS 'Many-to-many relationship between roles and permissions';
COMMENT ON TABLE services IS 'Digital services offered by Social IT';
COMMENT ON TABLE blogs IS 'Blog posts and articles';
COMMENT ON TABLE pages IS 'Generic pages with JSON-based page builder content';
COMMENT ON TABLE case_studies IS 'Client case studies and project showcases';

COMMENT ON COLUMN services.content IS 'JSONB structure for flexible page builder sections';
COMMENT ON COLUMN blogs.content IS 'JSONB structure for flexible page builder sections';
COMMENT ON COLUMN pages.content IS 'JSONB structure for flexible page builder sections';
COMMENT ON COLUMN case_studies.content IS 'JSONB structure for flexible page builder sections';
