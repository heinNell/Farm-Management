import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcaoevypackelcstdieu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYW9ldnlwYWNrZWxjc3RkaWV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwNTk1NywiZXhwIjoyMDc1NDgxOTU3fQ.IdBkcXFTSlcONLzYvUSN-11UngWbIsYG6xF2rU7XLDY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function removeDuplicates() {
  console.log('Removing duplicate assets...\n')
  
  // Get all assets
  const { data: assets, error } = await supabase
    .from('assets')
    .select('*')
    .order('name, created_at')
  
  if (error) {
    console.error('Error fetching assets:', error)
    return
  }
  
  console.log(`Total assets found: ${assets.length}`)
  
  // Group by name
  const grouped = assets.reduce((acc, asset) => {
    if (!acc[asset.name]) {
      acc[asset.name] = []
    }
    acc[asset.name].push(asset)
    return acc
  }, {})
  
  // Find duplicates and keep the newest one (last in array when sorted by created_at)
  const idsToDelete = []
  
  Object.entries(grouped).forEach(([name, assetList]) => {
    if (assetList.length > 1) {
      // Keep the last one (newest), delete the rest
      const toDelete = assetList.slice(0, -1)
      toDelete.forEach(asset => {
        idsToDelete.push(asset.id)
        console.log(`Will delete: ${name} (ID: ${asset.id.substring(0, 8)}... Created: ${asset.created_at})`)
      })
      console.log(`Keeping: ${name} (ID: ${assetList[assetList.length - 1].id.substring(0, 8)}... Created: ${assetList[assetList.length - 1].created_at})\n`)
    }
  })
  
  console.log(`\n\nDeleting ${idsToDelete.length} duplicate assets...`)
  
  // Delete in batches of 10
  for (let i = 0; i < idsToDelete.length; i += 10) {
    const batch = idsToDelete.slice(i, i + 10)
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .in('id', batch)
    
    if (deleteError) {
      console.error(`Error deleting batch ${i / 10 + 1}:`, deleteError)
    } else {
      console.log(`✓ Deleted batch ${i / 10 + 1} (${batch.length} assets)`)
    }
  }
  
  // Verify
  const { data: remaining, error: verifyError } = await supabase
    .from('assets')
    .select('id, name, type')
  
  if (verifyError) {
    console.error('Error verifying:', verifyError)
  } else {
    console.log(`\n✅ Cleanup complete! Remaining assets: ${remaining.length}`)
    console.log('\nAssets by type:')
    const byType = remaining.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1
      return acc
    }, {})
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
  }
}

removeDuplicates()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
