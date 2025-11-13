import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcaoevypackelcstdieu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYW9ldnlwYWNrZWxjc3RkaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDU5NTcsImV4cCI6MjA3NTQ4MTk1N30.tgSj9ywCpAuLHr2Y_yp-SB9NNKo7Qz7zNPF9HVlxVDk'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAssetQueries() {
  console.log('Testing asset queries...\n')
  
  // Test 1: Select all assets
  console.log('1. Selecting all assets...')
  const { data: assets, error: selectError } = await supabase
    .from('assets')
    .select('*')
  
  if (selectError) {
    console.error('SELECT ERROR:', selectError)
  } else {
    console.log(`✓ Found ${assets?.length || 0} assets`)
    if (assets && assets.length > 0) {
      console.log('First asset:', assets[0].name)
    }
  }
  
  // Test 2: Try to insert a test asset
  console.log('\n2. Attempting to create a test asset...')
  const testAsset = {
    name: 'TEST-ASSET-1',
    type: 'TRACTOR',
    status: 'active',
    model: 'Test Model',
    fuel_type: 'Diesel'
  }
  
  const { data: newAsset, error: insertError } = await supabase
    .from('assets')
    .insert([testAsset])
    .select()
    .single()
  
  if (insertError) {
    console.error('INSERT ERROR:', insertError)
  } else {
    console.log('✓ Asset created:', newAsset.name)
    
    // Clean up - delete the test asset
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', newAsset.id)
    
    if (deleteError) {
      console.error('DELETE ERROR:', deleteError)
    } else {
      console.log('✓ Test asset cleaned up')
    }
  }
}

testAssetQueries()
  .then(() => {
    console.log('\nTest complete!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
