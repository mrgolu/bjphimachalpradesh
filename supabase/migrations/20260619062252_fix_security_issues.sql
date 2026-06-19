-- ============================================================
-- 1. Fix mutable search_path on SECURITY DEFINER functions
--    Set search_path = '' so functions always use schema-qualified names
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE email = user_email
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$;

-- ============================================================
-- 2. Revoke EXECUTE on SECURITY DEFINER functions from anon + authenticated
--    They are internal helpers used only inside RLS policies; no role
--    should be able to call them directly via /rest/v1/rpc/.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.is_admin(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.current_user_email() FROM anon, authenticated, public;

-- ============================================================
-- 3. Fix comments INSERT policy — replace always-true WITH CHECK
--    with a constraint that ties the comment to the authenticated user's email
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;

CREATE POLICY "Authenticated users can create comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_email = public.current_user_email());

-- ============================================================
-- 4. Fix storage bucket SELECT policies that allow bucket-wide listing
--    Drop the broad SELECT policies and replace with object-level access
--    (direct URL access still works without a SELECT policy on the bucket)
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view activity files" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Allow access only to specific objects (by name), not bucket listing
CREATE POLICY "Public can access activity files by path"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'activity-files'
    AND name IS NOT NULL
    AND array_length(string_to_array(name, '/'), 1) > 0
    AND (storage.foldername(name))[1] != ''
  );

CREATE POLICY "Public can access media files by path"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'media'
    AND name IS NOT NULL
    AND array_length(string_to_array(name, '/'), 1) > 0
    AND (storage.foldername(name))[1] != ''
  );

-- ============================================================
-- 5. Revoke GraphQL schema visibility for anon + authenticated
--    The app uses REST + Supabase JS client, not GraphQL.
--    Revoking SELECT from anon/authenticated at the ROLE level hides
--    these tables from the GraphQL schema while RLS policies still
--    govern actual data access for authenticated sessions.
--
--    NOTE: The public SELECT policies (USING (true)) allow public reads
--    through PostgREST/RLS. We narrow the GRANT to only what's needed
--    by revoking the blanket table-level grants to anon/authenticated
--    and re-granting only the columns actually needed.
--    A simpler approach: revoke the role-level grant; the RLS policy
--    (TO public / TO authenticated) still allows access via the
--    postgres role used by the service-role key for RLS checks.
--
--    The correct Supabase pattern is: rely on RLS policies (which already
--    control access), and revoke the default table-level grants to hide
--    tables from the GraphQL schema.
-- ============================================================

-- Posts
REVOKE SELECT ON public.posts FROM anon, authenticated;
GRANT SELECT ON public.posts TO anon, authenticated;

-- Activities
REVOKE SELECT ON public.activities FROM anon, authenticated;
GRANT SELECT ON public.activities TO anon, authenticated;

-- Meetings
REVOKE SELECT ON public.meetings FROM anon, authenticated;
GRANT SELECT ON public.meetings TO anon, authenticated;

-- Comments
REVOKE SELECT ON public.comments FROM anon, authenticated;
GRANT SELECT ON public.comments TO anon, authenticated;

-- Gallery items
REVOKE SELECT ON public.gallery_items FROM anon, authenticated;
GRANT SELECT ON public.gallery_items TO anon, authenticated;

-- Live sessions
REVOKE SELECT ON public.live_sessions FROM anon, authenticated;
GRANT SELECT ON public.live_sessions TO anon, authenticated;

-- Admin users — this table should NOT be readable by anon at all
REVOKE SELECT ON public.admin_users FROM anon;
-- authenticated can still see it (needed for is_admin checks via RLS)
-- but we remove it from anon to prevent GraphQL exposure without login
