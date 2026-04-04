-- Shop status: enable Realtime for public.shops (safe to run multiple times).
-- If you previously ran ALTER PUBLICATION ... ADD TABLE and saw:
--   ERROR 42710: relation "shops" is already member of publication
-- then Realtime was ALREADY on — no action needed for this step.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'shops'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;
  END IF;
END $$;
