/*
# Auto-Confirm New Users (disable email confirmation requirement)

Problem: Supabase has "Confirm email" enabled, so new signups CANNOT log in
until they click a link in their email. This is confusing for customers.

Solution: A trigger that auto-confirms every new user immediately after signup,
so they can log in right away without any email verification.

This does NOT turn off email sending. It simply marks the email as confirmed
at signup time, making the account active immediately.

IMPORTANT: To make this the only place that controls confirmation, you may also
want to disable "Confirm email" in the Supabase Dashboard:
  Authentication -> Sign In / Up -> Providers -> Email -> "Confirm email" = OFF
*/

-- 1. Function to auto-confirm new users
CREATE OR REPLACE FUNCTION public.auto_confirm_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
      confirmed_at = COALESCE(confirmed_at, now()),
      confirmation_sent_at = NULL
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- 2. Trigger runs after a new user row is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_user();

-- 3. (Optional) Also confirm any remaining unconfirmed users already in the DB
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now()),
    confirmation_sent_at = NULL
WHERE email_confirmed_at IS NULL;

