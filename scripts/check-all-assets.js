import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcaoevypackelcstdieu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYW9ldnlwYWNrZWxjc3RkaWV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwNTk1NywiZXhwIjoyMDc1NDgxOTU3fQ.IdBkcXFTSlcONLzYvUSN-11UngWbIsYG6xF2rU7XLDY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAssets() {
  console.log('Checking all assets in database...\n')
  
  const { data, error } = await supabase
    .from('assets')
    .select('id, name, type, created_at')
    .order('name')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log(`Total assets: ${data.length}\n`)
  
  // Group by name to find duplicates
  const grouped = data.reduce((acc, asset) => {
    if (!acc[asset.name]) {
      acc[asset.name] = []
    }
    acc[asset.name].push(asset)
    return acc
  }, {})
  
  // Show duplicates
  console.log('DUPLICATES:')
  Object.entries(grouped).forEach(([name, assets]) => {
    if (assets.length > 1) {
      console.log(`\n${name}: ${assets.length} copies`)
      assets.forEach(a => {
        console.log(`  - ID: ${a.id.substring(0, 8)}... Created: ${a.created_at}`)
      })
    }
  })
  
  // Show all unique names
  console.log('\n\nUNIQUE ASSET NAMES:')
  Object.keys(grouped).sort().forEach((name, i) => {
    console.log(`${i + 1}. ${name} (${grouped[name][0].type})`)
  })
}

checkAssets()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
