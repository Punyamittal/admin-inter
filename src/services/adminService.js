import { supabase } from '../lib/supabaseClient'
import { supabaseAdmin } from '../lib/supabaseAdmin'

// ── AUDIT LOG ──
export async function logAdminAction(action, targetType, targetId, details) {
  const { data: { session } } = await supabase.auth.getSession()
  const { error } = await supabaseAdmin.from('admin_logs').insert({
    admin_id: session?.user?.id,
    action,
    target_type: targetType,
    target_id: targetId,
    details
  })
  if (error) console.error('Error logging admin action:', error)
}

// ── LOCATIONS ──
export async function createLocation(data) {
  const { data: loc, error } = await supabaseAdmin
    .from('locations')
    .insert(data)
    .select()
    .single()
  
  if (!error) {
    await logAdminAction('created_location', 'location', loc?.id, data)
  }
  return { loc, error }
}

export async function deleteLocation(locationId) {
  // Check no shops exist first
  const { count, error: countError } = await supabaseAdmin
    .from('shops')
    .select('id', { count: 'exact', head: true })
    .eq('location_id', locationId)

  if (count > 0) return { error: { message: 'Location has shops. Remove them first.' } }

  const { error } = await supabaseAdmin
    .from('locations')
    .delete()
    .eq('id', locationId)
  
  if (!error) {
    await logAdminAction('deleted_location', 'location', locationId)
  }
  return { error }
}

// ── SHOPS ──
export async function createShop(data) {
  const { data: shop, error } = await supabaseAdmin
    .from('shops')
    .insert(data)
    .select()
    .single()
  
  if (!error) {
    await logAdminAction('created_shop', 'shop', shop?.id, data)
  }
  return { shop, error }
}

export async function assignVendorToShop(shopId, vendorId) {
  const { error } = await supabaseAdmin
    .from('shops')
    .update({ owner_id: vendorId })
    .eq('id', shopId)
  
  if (!error) {
    await logAdminAction('assigned_vendor', 'shop', shopId, { vendorId })
  }
  return { error }
}

export async function toggleShopStatus(shopId, currentIsActive) {
  const { error } = await supabaseAdmin
    .from('shops')
    .update({ is_active: !currentIsActive })
    .eq('id', shopId)
  
  return { error }
}

export async function deleteShop(shopId) {
  const { error } = await supabaseAdmin
    .from('shops')
    .delete()
    .eq('id', shopId)
  
  if (!error) {
    await logAdminAction('deleted_shop', 'shop', shopId)
  }
  return { error }
}

// ── VENDORS ──
export async function createVendor(email, fullName, password, shopId) {
  // Step 1: Create auth user using server-side admin client
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'vendor'
      }
    })
    
  if (authError) return { error: authError }

  // Step 2: Update profile role (assuming handle_new_user trigger creates profile)
  // We explicitly update to ensure full_name is correct
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'vendor', full_name: fullName })
    .eq('id', authData.user.id)

  if (profileError) return { error: profileError }

  // Step 3: Assign shop if provided
  if (shopId) {
    const { error: shopError } = await supabaseAdmin
      .from('shops')
      .update({ owner_id: authData.user.id })
      .eq('id', shopId)
    if (shopError) return { error: shopError }
  }

  await logAdminAction('created_vendor', 'vendor', authData.user.id, { email, shopId })
  return { userId: authData.user.id, error: null }
}

export async function deactivateVendor(vendorId) {
  // Step 1: Set inactive in profiles
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: false })
    .eq('id', vendorId)

  if (profileError) return { error: profileError }

  // Step 2: Unlink from any shops
  const { error: shopError } = await supabaseAdmin
    .from('shops')
    .update({ owner_id: null })
    .eq('owner_id', vendorId)

  if (shopError) return { error: shopError }

  // Step 3: Ban user from auth
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(vendorId, {
    ban_duration: '87600h'    // ~10 years
  })

  if (authError) return { error: authError }

  await logAdminAction('deactivated_vendor', 'vendor', vendorId)
  return { error: null }
}

// ── ANALYTICS ──
export async function getAllShopsAnalytics(fromDate, toDate) {
  const { data, error } = await supabaseAdmin
    .from('v_shop_daily_revenue')
    .select('*')
    .gte('day', fromDate)
    .lte('day', toDate)
    .order('total_revenue', { ascending: false })
  return { data, error }
}

export async function getGlobalAnalytics(fromDate, toDate) {
  const { data, error } = await supabaseAdmin
    .from('v_campus_daily')
    .select('*')
    .gte('day', fromDate)
    .lte('day', toDate)
    .order('day', { ascending: true })
  return { data, error }
}
