-- TradeCraft Database Schema
-- PostgreSQL with pgvector extension for embeddings

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    preferred_language VARCHAR(50) DEFAULT 'English',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 255),
    CONSTRAINT bio_length CHECK (LENGTH(bio) <= 1000)
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- SKILLS TABLE
-- =====================================================
CREATE TYPE skill_mode AS ENUM ('TEACH', 'LEARN');

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    mode skill_mode NOT NULL,
    level INTEGER NOT NULL,
    availability JSONB DEFAULT '[]'::jsonb,
    -- Vector embedding (384 dimensions for all-MiniLM-L6-v2)
    embedding vector(384),
    canonical_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT skill_level_range CHECK (level >= 1 AND level <= 5),
    CONSTRAINT skill_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 255),
    CONSTRAINT availability_is_array CHECK (jsonb_typeof(availability) = 'array')
);

-- Indexes for performance
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_mode ON skills(mode);
CREATE INDEX idx_skills_name ON skills(name);

-- Vector similarity index (HNSW for fast approximate nearest neighbor search)
CREATE INDEX idx_skills_embedding ON skills USING hnsw (embedding vector_cosine_ops);

-- =====================================================
-- MATCHES TABLE
-- =====================================================
CREATE TYPE match_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill1_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    skill2_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    
    -- Match scoring components
    semantic_score DECIMAL(5,4) NOT NULL,
    reciprocity_score DECIMAL(5,4) NOT NULL,
    availability_score DECIMAL(5,4) NOT NULL,
    preference_score DECIMAL(5,4) NOT NULL,
    total_score DECIMAL(5,4) NOT NULL,
    
    -- AI-generated explanation
    explanation TEXT NOT NULL,
    
    status match_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT different_users CHECK (user1_id != user2_id),
    CONSTRAINT different_skills CHECK (skill1_id != skill2_id),
    CONSTRAINT score_range CHECK (
        semantic_score >= 0 AND semantic_score <= 1 AND
        reciprocity_score >= 0 AND reciprocity_score <= 1 AND
        availability_score >= 0 AND availability_score <= 1 AND
        preference_score >= 0 AND preference_score <= 1 AND
        total_score >= 0 AND total_score <= 1
    ),
    CONSTRAINT explanation_length CHECK (LENGTH(explanation) >= 10 AND LENGTH(explanation) <= 1000),
    -- Prevent duplicate matches (bidirectional uniqueness)
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id, skill1_id, skill2_id)
);

-- Indexes
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_score ON matches(total_score DESC);

-- =====================================================
-- SESSIONS TABLE
-- =====================================================
CREATE TYPE session_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    agenda TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status session_status DEFAULT 'SCHEDULED',
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT duration_valid CHECK (duration_minutes IN (30, 45, 60)),
    CONSTRAINT scheduled_future CHECK (scheduled_at > NOW()),
    CONSTRAINT agenda_length CHECK (LENGTH(agenda) >= 20 AND LENGTH(agenda) <= 2000),
    CONSTRAINT notes_length CHECK (notes IS NULL OR LENGTH(notes) <= 2000)
);

-- Indexes
CREATE INDEX idx_sessions_match_id ON sessions(match_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON sessions(status);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT content_length CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 2000)
);

-- Indexes
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users: Can read all, but only update their own profile
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills: Users can only manage their own skills
CREATE POLICY "Users can view all skills" ON skills
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own skills" ON skills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON skills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills" ON skills
    FOR DELETE USING (auth.uid() = user_id);

-- Matches: Users can view matches they're part of
CREATE POLICY "Users can view their matches" ON matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches" ON matches
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their matches" ON matches
    FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Sessions: Users can view/manage sessions for their matches
CREATE POLICY "Users can view their sessions" ON sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = sessions.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can create sessions for their matches" ON sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = sessions.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update their sessions" ON sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = sessions.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- Messages: Users can view/send messages in their matches
CREATE POLICY "Users can view messages in their matches" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their matches" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM matches 
            WHERE matches.id = messages.match_id 
            AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
        )
    );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to find similar skills using vector similarity
CREATE OR REPLACE FUNCTION find_similar_skills(
    query_embedding vector(384),
    query_mode skill_mode,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    skill_id UUID,
    skill_name VARCHAR,
    user_id UUID,
    similarity DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.user_id,
        1 - (s.embedding <=> query_embedding) AS similarity
    FROM skills s
    WHERE s.mode = query_mode
    AND s.embedding IS NOT NULL
    ORDER BY s.embedding <=> query_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate availability overlap
CREATE OR REPLACE FUNCTION calculate_availability_overlap(
    availability1 JSONB,
    availability2 JSONB
)
RETURNS DECIMAL AS $$
DECLARE
    overlap_count INTEGER := 0;
    total_slots INTEGER;
BEGIN
    -- Simple overlap calculation (can be enhanced)
    -- This is a placeholder - implement based on your availability JSON structure
    SELECT COUNT(*) INTO overlap_count
    FROM jsonb_array_elements(availability1) a1
    INNER JOIN jsonb_array_elements(availability2) a2
    ON a1 = a2;
    
    total_slots := GREATEST(jsonb_array_length(availability1), jsonb_array_length(availability2));
    
    IF total_slots = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN overlap_count::DECIMAL / total_slots::DECIMAL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Stores user profiles and authentication information';
COMMENT ON TABLE skills IS 'Stores skills users can teach or want to learn, with embeddings for semantic matching';
COMMENT ON TABLE matches IS 'Stores skill exchange matches between users with scoring breakdown';
COMMENT ON TABLE sessions IS 'Stores scheduled learning sessions between matched users';
COMMENT ON TABLE messages IS 'Stores messages exchanged between matched users';

COMMENT ON COLUMN skills.embedding IS 'Vector embedding (384-dim) from all-MiniLM-L6-v2 model';
COMMENT ON COLUMN skills.canonical_text IS 'Canonical text representation used to generate embedding';
COMMENT ON COLUMN matches.semantic_score IS 'Cosine similarity between skill embeddings (0-1)';
COMMENT ON COLUMN matches.reciprocity_score IS 'Score based on skill level compatibility (0-1)';
COMMENT ON COLUMN matches.availability_score IS 'Score based on schedule overlap (0-1)';
COMMENT ON COLUMN matches.preference_score IS 'Score based on language and other preferences (0-1)';
COMMENT ON COLUMN matches.total_score IS 'Weighted combination of all scores (0-1)';
