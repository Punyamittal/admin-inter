import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jpuapnsrtozlwnvgmfve.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdWFwbnNydG96bHdudmdtZnZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQwNzM2NSwiZXhwIjoyMDg5OTgzMzY1fQ.x68KDMUVgRCm0goECU88BSUoQTV9keVFx0vUgkoKvSE'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function testSimpleCreate() {
  const email = 'superadmin@vitstudent.ac.in'
  const password = 'ChangeThis@Launch1!'
  
  console.log('Testing VERY SIMPLE user creation (no metadata)...')
  
  const { data: newUser, error: createError } = await supabaseAdmin
    .auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

  if (createError) {
    console.error('FAILED to create user:', createError.message)
    // If it fails here, the trigger is likely the culprit regardless of metadata.
  } else {
    console.log('User created successfully without metadata! ID:', newUser.user.id)
    console.log('Updating profile manually...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        role: 'super_admin',
        full_name: 'Campus Super Admin'
      })
      .eq('id', newUser.user.id)
    
    if (profileError) {
      console.error('FAILED to update profile:', profileError.message)
    } else {
      console.log('Profile updated. Account ready.')
    }
  }
}

testSimpleCreate()
