// Confirm all unconfirmed users via admin API so they can log in immediately.
// This is a one-time cleanup. To make ALL NEW signups work without confirmation,
// you MUST disable "Confirm email" in Supabase Dashboard:
//   Authentication -> Sign In / Up -> Providers -> Email -> turn OFF "Confirm email"
import { writeFileSync } from 'fs';

const base = 'https://ipkzrmvdzdcxcdzvvatl.supabase.co';
const serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU3MjE5MSwiZXhwIjoyMTAxMTQ4MTkxfQ.0HXu_d77OjN3tlmEnfD6JPNocUa3g13MewR5bzmUarU';

async function main() {
  const lines = [];
  let confirmed = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // 1. List all users
    const res = await fetch(`${base}/auth/v1/admin/users?per_page=1000`, {
      headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` },
    });
    const data = await res.json();

    if (data.code) {
      lines.push(`ERROR from API: ${JSON.stringify(data)}`);
      writeFileSync('confirm_users_result.txt', lines.join('\n'));
      console.log('Done. See confirm_users_result.txt');
      return;
    }

    const users = data.users || data || [];
    lines.push(`Total users found: ${users.length}`);
    lines.push('');

    for (const user of users) {
      const isConfirmed = Boolean(user.email_confirmed_at);
      if (isConfirmed) {
        skipped++;
        continue;
      }
      // Confirm this user
      const updRes = await fetch(`${base}/auth/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_confirm: true }),
      });
      if (updRes.ok) {
        confirmed++;
        lines.push(`CONFIRMED: ${user.email} (${user.id})`);
      } else {
        errors++;
        lines.push(`FAILED: ${user.email} - HTTP ${updRes.status}`);
      }
    }

    lines.push('');
    lines.push(`=== SUMMARY ===`);
    lines.push(`Confirmed: ${confirmed}`);
    lines.push(`Already confirmed: ${skipped}`);
    lines.push(`Errors: ${errors}`);
  } catch (e) {
    lines.push(`ERROR: ${e.message}`);
  }

  writeFileSync('confirm_users_result.txt', lines.join('\n'));
  console.log('Done. See confirm_users_result.txt');
}

main();

