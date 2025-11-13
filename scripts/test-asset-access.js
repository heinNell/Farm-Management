import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcaoevypackelcstdieu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYW9ldnlwYWNrZWxjc3RkaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDU5NTcsImV4cCI6MjA3NTQ4MTk1N30.gVJxR1-DXXmXyZ7_2bqr-R_JP7P2CpnLFMkS1ExFB5w'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAssetAccess() {
  console.log('Testing asset access with anon key...\n')
  
  // Test 1: Try to select assets
  console.log('1. Attempting to SELECT assets...')
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .limit(5)
  
  if (error) {
    console.error('❌ SELECT ERROR:', error.message)
    console.error('Details:', error)
  } else {
    console.log(`✅ SUCCESS! Found ${data?.length || 0} assets`)
    if (data && data.length > 0) {
      console.log('\nSample assets:')
      data.forEach((asset, i) => {
        console.log(`  ${i + 1}. ${asset.name} (${asset.type})`)
      })
    }
  }
  
  // Test 2: Check RLS policies
  console.log('\n2. Checking if RLS is blocking access...')
  const { data: policies, error: policyError } = await supabase
    .rpc('exec_sql', { 
      sql: `SELECT * FROM pg_policies WHERE tablename = 'assets'` 
    })
  
  if (policyError) {
    console.log('Cannot check policies (expected with anon key)')
  } else {
    console.log('Policies:', policies)
  }
}

testAssetAccess()
  .then(() => {
    console.log('\n✅ Test complete!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  })
