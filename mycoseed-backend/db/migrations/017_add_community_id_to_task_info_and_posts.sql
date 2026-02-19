-- ============================================
-- 为 task_info、community_posts 增加 community_id；插入南塘社区并迁移现有数据
-- ============================================

-- 1. 插入默认社区「南塘」（若不存在）。slug = nantang 作邀请码
INSERT INTO communities (id, name, slug, description, markdown_intro, is_public, point_name, super_admin_id, created_at, updated_at)
SELECT 
    '00000000-0000-0000-0000-000000000002',
    '南塘',
    'nantang',
    '素舍提供乡村村民宿餐饮，体验乡村生活，感受自然之美。',
    E'# 南塘\n\n欢迎来到南塘，素舍提供乡村村民宿餐饮服务。\n\n## 我们的特色\n- 乡村民宿体验\n- 地道乡村餐饮\n- 自然生态体验\n- 南塘豆积分奖励',
    true,
    '南塘豆',
    NULL,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM communities WHERE id = '00000000-0000-0000-0000-000000000002');

-- 2. task_info 增加 community_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'task_info' AND column_name = 'community_id'
    ) THEN
        ALTER TABLE task_info ADD COLUMN community_id UUID REFERENCES communities(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_task_info_community_id ON task_info(community_id);
        -- 现有任务归到南塘
        UPDATE task_info SET community_id = '00000000-0000-0000-0000-000000000002' WHERE community_id IS NULL;
    END IF;
END $$;

-- 3. community_posts：现有 NULL 归到南塘（表已存在且含 community_id 时）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'community_id') THEN
        UPDATE community_posts SET community_id = '00000000-0000-0000-0000-000000000002' WHERE community_id IS NULL;
    END IF;
END $$;
