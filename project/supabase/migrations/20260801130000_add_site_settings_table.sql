/*
# Site settings persistence

1. Create a single-row table to store public storefront settings.
2. Allow anonymous visitors to read those settings for the storefront.
3. Allow only admins to modify them.
*/

CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  );
$$;

DROP POLICY IF EXISTS "read_site_settings" ON public.site_settings;
CREATE POLICY "read_site_settings" ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "manage_site_settings_admin" ON public.site_settings;
CREATE POLICY "manage_site_settings_admin" ON public.site_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

INSERT INTO public.site_settings (id, settings)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
