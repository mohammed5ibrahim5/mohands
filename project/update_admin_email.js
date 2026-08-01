// Update admin user email in the new Supabase project
import { writeFileSync } from 'fs';

const base = 'https://ipkzrmvdzdcxcdzvvatl.supabase.co';
const serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU3MjE5MSwiZXhwIjoyMTAxMTQ4MTkxfQ.0HXu_d77OjN3tlmEnfD6JPNocUa3g13MewR5bzmUarU';

const oldEmail = 'admin@maktabti.com';
const newEmail = 'admin@mohandes-bakarnia.com';
const lines = [];

async function main() {
  try {
    // Find the admin user
    const lookupRes = await fetch(`${base}/auth/v1/admin/users?email=${encodeURIComponent(oldEmail)}`, {
      headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` },
    });
    const lookupData = await lookupRes.json();
    const user = lookupData.users?.find(u => u.email === oldEmail);

    if (!user) {
      lines.push(`USER NOT FOUND with email ${oldEmail}`);
    } else {
      // Update email
      const res = await fetch(`${base}/auth/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail, email_confirm: true }),
      });
      const data = await res.json();
      if (res.ok) lines.push(`EMAIL UPDATED: ${oldEmail} -> ${newEmail}`);
      else lines.push(`UPDATE ERROR ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (e) {
    lines.push(`ERROR: ${e.message}`);
  }
  writeFileSync('admin_email_result.txt', lines.join('\n'));
  console.log('Done. See admin_email_result.txt');
}

main();

