import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcaoevypackelcstdieu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYW9ldnlwYWNrZWxjc3RkaWV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwNTk1NywiZXhwIjoyMDc1NDgxOTU3fQ.IdBkcXFTSlcONLzYvUSN-11UngWbIsYG6xF2rU7XLDY'

const supabase = createClient(supabaseUrl, supabaseKey)

// Asset mapping with proper fleet numbers and types
const updates = [
  { old: 'TOYOTA FORKLIFT (FL3)', new: 'FL3 - FORKLIFT' },
  { old: 'TOYOTA FORKLIFT (FL5)', new: 'FL5 - FORKLIFT' },
  { old: 'LANDINI LANDINI 75 CAB (BVTR5)', new: 'BVTR5 - TRACTOR' },
  { old: 'LANDINI LANDINI 60 (BVTR15)', new: 'BVTR15 - TRACTOR' },
  { old: 'JOHN DEERE 5076EN (BVTR10)', new: 'BVTR10 - TRACTOR' },
  { old: 'NEW HOLLAND TT55 (BVTR14)', new: 'BVTR14 - TRACTOR' },
  { old: 'CUMMINS C110 GENSET (GS3)', new: 'GS3 - GENERATOR' },
  { old: 'JOHN DEERE 5076EN (BVTR6)', new: 'BVTR6 - TRACTOR' },
  { old: 'LANDINI LANDINI 85 CAB (BVTR8)', new: 'BVTR8 - TRACTOR' },
  { old: 'NEW HOLLAND TT55 (BVTR17)', new: 'BVTR17 - TRACTOR' },
  { old: 'MASSEY FERGUSEN 268 (BVTR26)', new: 'BVTR26 - TRACTOR' },
  { old: 'GENERATOR GENERATOR (GS4)', new: 'GS4 - GENERATOR' },
  { old: 'LANDINI LANDINI 75 CAB (BVTR4)', new: 'BVTR4 - TRACTOR' },
  { old: 'NEW HOLLAND TT55 (BVTR23)', new: 'BVTR23 - TRACTOR' },
  { old: 'LANDINI LANDINI 60 (BVTR21)', new: 'BVTR21 - TRACTOR' },
  { old: 'ISUZU F5000 (BE1)', new: 'BE1 - TRUCK' },
  { old: 'UNKNOWN MAKE UNKNOWN MODEL (BEC)', new: 'BEC - CRUSHER' },
  { old: 'UNKNOWN MAKE UNKNOWN MODEL (RCH)', new: 'RCH - VEHICLE' },
  { old: 'UNKNOWN MAKE UNKNOWN MODEL (BEP1)', new: 'BEP1 - VEHICLE' },
  { old: 'GENERATOR GENERATOR (GENSET5)', new: 'GENSET5 - GENERATOR' },
  { old: 'NEW HOLLAND TD95 (BVTR1)', new: 'BVTR1 - TRACTOR' },
  { old: 'TOYOTA FORKLIFT (FL1)', new: 'FL1 - FORKLIFT' },
  { old: 'LANDINI LANDINI 85 CAB (BVTR20)', new: 'BVTR20 - TRACTOR' },
  { old: 'NEW HOLLAND TT55 (BVTR22)', new: 'BVTR22 - TRACTOR' },
  { old: 'TOYOTA FORKLIFT (FL2)', new: 'FL2 - FORKLIFT' },
  { old: 'TOYOTA FORKLIFT (FL4)', new: 'FL4 - FORKLIFT' },
  { old: 'TOYOTA FORKLIFT (FL6)', new: 'FL6 - FORKLIFT' },
  { old: 'TOYOTA FORKLIFT (FL7)', new: 'FL7 - FORKLIFT' },
  { old: 'VOLVO PENTA GENERATOR (GS1)', new: 'GS1 - GENERATOR' },
  { old: 'CUMMINS C110 GENSET (GS2)', new: 'GS2 - GENERATOR' },
  { old: 'LANDINI LANDINI 75 CAB (BVTR2)', new: 'BVTR2 - TRACTOR' },
  { old: 'LANDINI LANDINI 85 CAB (BVTR19)', new: 'BVTR19 - TRACTOR' },
  { old: 'JOHN DEERE 5076EN (BVTR9)', new: 'BVTR9 - TRACTOR' },
  { old: 'NEW HOLLAND TD95 (BVTR11)', new: 'BVTR11 - TRACTOR' },
  { old: 'NEW HOLLAND TT55 (BVTR16)', new: 'BVTR16 - TRACTOR' },
  { old: 'NEW HOLLAND TT55 (BVTR25)', new: 'BVTR25 - TRACTOR' }
]

async function updateAssetNames() {
  console.log('Updating asset names using raw SQL...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (const { old: oldName, new: newName } of updates) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `UPDATE assets SET name = '${newName}' WHERE name = '${oldName}'`
      })
      
      if (error) {
        // Try direct update instead
        const { error: updateError } = await supabase
          .from('assets')
          .update({ name: newName })
          .eq('name', oldName)
        
        if (updateError) {
          console.error(`❌ Error updating "${oldName}":`, updateError.message)
          errorCount++
        } else {
          console.log(`✓ Updated: ${oldName} → ${newName}`)
          successCount++
        }
      } else {
        console.log(`✓ Updated: ${oldName} → ${newName}`)
        successCount++
      }
    } catch (err) {
      console.error(`❌ Exception updating "${oldName}":`, err.message)
      errorCount++
    }
  }
  
  console.log(`\n========================================`)
  console.log(`Update Complete!`)
  console.log(`✅ Updated: ${successCount} assets`)
  console.log(`❌ Errors: ${errorCount} assets`)
  console.log(`========================================`)
}

updateAssetNames()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
