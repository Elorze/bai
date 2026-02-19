-- 将用户 CC 任命为南塘社区的总管理员
-- 南塘社区 ID: 00000000-0000-0000-0000-000000000002

DO $$
DECLARE
  nantang_id UUID := '00000000-0000-0000-0000-000000000002';
  cc_user_id UUID;
BEGIN
  -- 按名字查找 CC（取第一个匹配）
  SELECT id INTO cc_user_id
  FROM users
  WHERE name = 'CC'
  LIMIT 1;

  IF cc_user_id IS NULL THEN
    RAISE EXCEPTION '未找到用户 CC，请确认 users 表中存在 name = ''CC'' 的记录';
  END IF;

  -- 1. 确保 CC 是南塘成员且角色为 super_admin
  INSERT INTO community_members (community_id, user_id, role)
  VALUES (nantang_id, cc_user_id, 'super_admin')
  ON CONFLICT (community_id, user_id)
  DO UPDATE SET role = 'super_admin';

  -- 2. 将南塘的 super_admin_id 设为 CC
  UPDATE communities
  SET super_admin_id = cc_user_id, updated_at = NOW()
  WHERE id = nantang_id;

  RAISE NOTICE '已将用户 CC (id: %) 任命为南塘社区总管理员', cc_user_id;
END $$;
