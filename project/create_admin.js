// Create admin user in the new Supabase project
import { writeFileSync } from 'fs';

const base = 'https://ipkzrmvdzdcxcdzvvatl.supabase.co';
const serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU3MjE5MSwiZXhwIjoyMTAxMTQ4MTkxfQ.0HXu_d77OjN3tlmEnfD6JPNocUa3g13MewR5bzmUarU';

const adminEmail = 'admin@maktabti.com';
const adminPassword = 'Admin@123456';

async function main() {
  const lines = [];
  try {
    // 1. Check if user already exists
    const lookupRes = await fetch(`${base}/auth/v1/admin/users?email=${encodeURIComponent(adminEmail)}`, {
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
      },
    });
    const lookupData = await lookupRes.json();
    const existing = lookupData.users?.find(u => u.email === adminEmail);

    let userId = existing?.id;

    if (!userId) {
      // 2. Create user via auth admin API
      const res = await fetch(`${base}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { full_name: 'مدير المتجر' },
        }),
      });
      const data = await res.json();
      if (res.status >= 400) {
        lines.push(`CREATE USER ERROR ${res.status}: ${JSON.stringify(data)}`);
      } else {
        userId = data.id;
        lines.push(`ADMIN USER CREATED: ${adminEmail} / ${adminPassword}`);
      }
    } else {
      lines.push(`ADMIN USER ALREADY EXISTS: ${adminEmail}`);
    }

    // 3. Set profile is_admin = true (via direct profiles insert or update)
    if (userId) {
      // Check profile
      const profRes = await fetch(`${base}/rest/v1/profiles?select=id&id=eq.${userId}`, {
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
        },
      });
      const existingProfile = await profRes.json();

      if (existingProfile.length > 0) {
        const upd = await fetch(`${base}/rest/v1/profiles?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ is_admin: true, full_name: 'مدير المتجر' }),
        });
        lines.push(`PROFILE UPDATED is_admin=true (HTTP ${upd.status})`);
      } else {
        const ins = await fetch(`${base}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ id: userId, full_name: 'مدير المتجر', is_admin: true }),
        });
        lines.push(`PROFILE CREATED is_admin=true (HTTP ${ins.status})`);
      }
    }
  } catch (e) {
    lines.push(`ERROR: ${e.message}`);
  }

  writeFileSync('admin_result.txt', lines.join('\n'));
  console.log('Done. See admin_result.txt');
}

main();

