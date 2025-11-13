import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcaoevypackelcstdieu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYW9ldnlwYWNrZWxjc3RkaWV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwNTk1NywiZXhwIjoyMDc1NDgxOTU3fQ.IdBkcXFTSlcONLzYvUSN-11UngWbIsYG6xF2rU7XLDY'

const supabase = createClient(supabaseUrl, supabaseKey)

// Asset mapping with proper fleet numbers and types
const assetMapping = {
  'TOYOTA FORKLIFT (FL3)': { fleet_no: 'FL3', asset_type: 'FORKLIFT' },
  'TOYOTA FORKLIFT (FL5)': { fleet_no: 'FL5', asset_type: 'FORKLIFT' },
  'LANDINI LANDINI 75 CAB (BVTR5)': { fleet_no: 'BVTR5', asset_type: 'TRACTOR' },
  'LANDINI LANDINI 60 (BVTR15)': { fleet_no: 'BVTR15', asset_type: 'TRACTOR' },
  'JOHN DEERE 5076EN (BVTR10)': { fleet_no: 'BVTR10', asset_type: 'TRACTOR' },
  'NEW HOLLAND TT55 (BVTR14)': { fleet_no: 'BVTR14', asset_type: 'TRACTOR' },
  'CUMMINS C110 GENSET (GS3)': { fleet_no: 'GS3', asset_type: 'GENERATOR' },
  'JOHN DEERE 5076EN (BVTR6)': { fleet_no: 'BVTR6', asset_type: 'TRACTOR' },
  'LANDINI LANDINI 85 CAB (BVTR8)': { fleet_no: 'BVTR8', asset_type: 'TRACTOR' },
  'NEW HOLLAND TT55 (BVTR17)': { fleet_no: 'BVTR17', asset_type: 'TRACTOR' },
  'MASSEY FERGUSEN 268 (BVTR26)': { fleet_no: 'BVTR26', asset_type: 'TRACTOR' },
  'GENERATOR GENERATOR (GS4)': { fleet_no: 'GS4', asset_type: 'GENERATOR' },
  'LANDINI LANDINI 75 CAB (BVTR4)': { fleet_no: 'BVTR4', asset_type: 'TRACTOR' },
  'NEW HOLLAND TT55 (BVTR23)': { fleet_no: 'BVTR23', asset_type: 'TRACTOR' },
  'LANDINI LANDINI 60 (BVTR21)': { fleet_no: 'BVTR21', asset_type: 'TRACTOR' },
  'ISUZU F5000 (BE1)': { fleet_no: 'BE1', asset_type: 'TRUCK' },
  'UNKNOWN MAKE UNKNOWN MODEL (BEC)': { fleet_no: 'BEC', asset_type: 'CRUSHER' },
  'UNKNOWN MAKE UNKNOWN MODEL (RCH)': { fleet_no: 'RCH', asset_type: 'VEHICLE' },
  'UNKNOWN MAKE UNKNOWN MODEL (BEP1)': { fleet_no: 'BEP1', asset_type: 'VEHICLE' },
  'GENERATOR GENERATOR (GENSET5)': { fleet_no: 'GENSET5', asset_type: 'GENERATOR' },
  'NEW HOLLAND TD95 (BVTR1)': { fleet_no: 'BVTR1', asset_type: 'TRACTOR' },
  'TOYOTA FORKLIFT (FL1)': { fleet_no: 'FL1', asset_type: 'FORKLIFT' },
  'LANDINI LANDINI 85 CAB (BVTR20)': { fleet_no: 'BVTR20', asset_type: 'TRACTOR' },
  'NEW HOLLAND TT55 (BVTR22)': { fleet_no: 'BVTR22', asset_type: 'TRACTOR' },
  'TOYOTA FORKLIFT (FL2)': { fleet_no: 'FL2', asset_type: 'FORKLIFT' },
  'TOYOTA FORKLIFT (FL4)': { fleet_no: 'FL4', asset_type: 'FORKLIFT' },
  'TOYOTA FORKLIFT (FL6)': { fleet_no: 'FL6', asset_type: 'FORKLIFT' },
  'TOYOTA FORKLIFT (FL7)': { fleet_no: 'FL7', asset_type: 'FORKLIFT' },
  'VOLVO PENTA GENERATOR (GS1)': { fleet_no: 'GS1', asset_type: 'GENERATOR' },
  'CUMMINS C110 GENSET (GS2)': { fleet_no: 'GS2', asset_type: 'GENERATOR' },
  'LANDINI LANDINI 75 CAB (BVTR2)': { fleet_no: 'BVTR2', asset_type: 'TRACTOR' },
  'LANDINI LANDINI 85 CAB (BVTR19)': { fleet_no: 'BVTR19', asset_type: 'TRACTOR' },
  'JOHN DEERE 5076EN (BVTR9)': { fleet_no: 'BVTR9', asset_type: 'TRACTOR' },
  'NEW HOLLAND TD95 (BVTR11)': { fleet_no: 'BVTR11', asset_type: 'TRACTOR' },
  'NEW HOLLAND TT55 (BVTR16)': { fleet_no: 'BVTR16', asset_type: 'TRACTOR' },
  'NEW HOLLAND TT55 (BVTR25)': { fleet_no: 'BVTR25', asset_type: 'TRACTOR' }
}

async function updateAssetNames() {
  console.log('Fetching all assets...')
  
  const { data: assets, error } = await supabase
    .from('assets')
    .select('*')
  
  if (error) {
    console.error('Error fetching assets:', error)
    return
  }
  
  console.log(`Found ${assets.length} assets to update`)
  
  let updateCount = 0
  let errorCount = 0
  
  for (const asset of assets) {
    const mapping = assetMapping[asset.name]
    
    if (mapping) {
      const newName = `${mapping.fleet_no} - ${mapping.asset_type}`
      
      const { error: updateError } = await supabase
        .from('assets')
        .update({ 
          name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id)
      
      if (updateError) {
        console.error(`Error updating ${asset.name}:`, updateError.message)
        errorCount++
      } else {
        console.log(`✓ Updated: ${asset.name} → ${newName}`)
        updateCount++
      }
    } else {
      console.warn(`⚠ No mapping found for: ${asset.name}`)
    }
  }
  
  console.log(`\n========================================`)
  console.log(`Update Complete!`)
  console.log(`✅ Updated: ${updateCount} assets`)
  console.log(`❌ Errors: ${errorCount} assets`)
  console.log(`========================================`)
}

updateAssetNames()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
