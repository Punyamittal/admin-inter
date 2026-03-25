import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function createVendors() {
  console.log('--- LINKING VENDORS (V3) ---');

  const vendors = [
    { name: 'Vendor A', email: 'vendor.a@vitstudent.ac.in', shop: 'Georgia' },
    { name: 'Vendor B', email: 'vendor.b@vitstudent.ac.in', shop: "Sri's" },
    { name: 'Vendor C', email: 'vendor.c@vitstudent.ac.in', shop: 'Hot & Cool' },
    { name: 'Vendor D', email: 'vendor.d@vitstudent.ac.in', shop: 'Alpha' }
  ];

  const { data: { users } } = await supabase.auth.admin.listUsers();

  for (const v of vendors) {
    console.log(`Processing ${v.name}...`);

    let existing = users.find(u => u.email === v.email);
    let userId;

    if (existing) {
        console.log(`  Found existing auth user: ${existing.id}`);
        userId = existing.id;
    } else {
        const { data: { user }, error: authErr } = await supabase.auth.admin.createUser({
            email: v.email,
            password: 'VendorPassword123!',
            email_confirm: true,
            user_metadata: { full_name: v.name, role: 'vendor' }
        });
        if (user) userId = user.id;
        else {
            console.error(`  Auth Error:`, authErr.message);
            continue;
        }
    }

    // Update Profile
    await supabase.from('profiles').upsert({
        id: userId,
        email: v.email,
        full_name: v.name,
        role: 'vendor',
        is_active: true
    });

    // Link to Shop
    const { error: sErr } = await supabase.from('shops').update({ 
        owner_id: userId 
    }).eq('name', v.shop);

    if (sErr) console.error(`  Shop link fail (${v.shop}):`, sErr);
    else console.log(`  Linked ${v.name} to ${v.shop}`);
  }
}

createVendors();
