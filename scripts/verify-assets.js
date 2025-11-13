import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcaoevypackelcstdieu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYW9ldnlwYWNrZWxjc3RkaWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDU5NTcsImV4cCI6MjA3NTQ4MTk1N30.gVJxR1-DXXmXyZ7_2bqr-R_JP7P2CpnLFMkS1ExFB5w'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyAssets() {
  console.log('Verifying assets visible to the app...\n')
  
  const { data, error } = await supabase
    .from('assets')
    .select('id, name, type, current_hours')
    .order('name')
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log(`✅ Found ${data.length} assets\n`)
  
  console.log('First 10 assets:')
  data.slice(0, 10).forEach((asset, i) => {
    console.log(`${i + 1}. Name: "${asset.name}" | Type: "${asset.type}" | Hours: ${asset.current_hours || 0}`)
  })
  
  console.log('\n\nAssets by type:')
  const byType = data.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1
    return acc
  }, {})
  
  Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`)
  })
}

verifyAssets()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
