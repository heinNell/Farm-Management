import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcaoevypackelcstdieu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYW9ldnlwYWNrZWxjc3RkaWV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwNTk1NywiZXhwIjoyMDc1NDgxOTU3fQ.IdBkcXFTSlcONLzYvUSN-11UngWbIsYG6xF2rU7XLDY'

const supabase = createClient(supabaseUrl, supabaseKey)

const assetsData = [
  { location: "BOMPONI FARM", fleet_no: "FL3", manufacturer: "TOYOTA", model: "FORKLIFT", asset_group: "FORKLIFT", asset_type: "FRONT FORKLIFT", powered_by: "DIESEL" },
  { location: "BOMPONI FARM", fleet_no: "FL5", manufacturer: "TOYOTA", model: "FORKLIFT", asset_group: "FORKLIFT", asset_type: "FRONT FORKLIFT", powered_by: "DIESEL" },
  { location: "BOMPONI FARM", fleet_no: "BVTR5", manufacturer: "LANDINI", model: "LANDINI 75 CAB", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "TLNL/AA", engine_no: "TLNLN51072" },
  { location: "BOMPONI FARM", fleet_no: "BVTR15", manufacturer: "LANDINI", model: "LANDINI 60", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "TL21DT/K(DT6860)", engine_no: "5373H28001" },
  { location: "BOMPONI FARM", fleet_no: "BVTR10", manufacturer: "JOHN DEERE", model: "5076EN", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "IPY5065EVGP021392", engine_no: "IPY5065EVGP021392" },
  { location: "BOMPONI FARM", fleet_no: "BVTR14", manufacturer: "NEW HOLLAND", model: "TT55", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "NH8435773", engine_no: "236638DT" },
  { location: "BRANDHILL", fleet_no: "GS3", manufacturer: "CUMMINS", model: "C110 GENSET", asset_group: "GENERATOR", asset_type: "GENERATOR", powered_by: "DIESEL" },
  { location: "BRANDHILL", fleet_no: "BVTR6", manufacturer: "JOHN DEERE", model: "5076EN", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "PY3029T252218", engine_no: "IPY5065ECGP021383" },
  { location: "BRANDHILL", fleet_no: "BVTR8", manufacturer: "LANDINI", model: "LANDINI 85 CAB", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "TL22DT/K(DT6860)", engine_no: "5369F22201" },
  { location: "BRANDHILL", fleet_no: "BVTR17", manufacturer: "NEW HOLLAND", model: "TT55", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "GEIR4D", engine_no: "8423798" },
  { location: "BRANDHILL", fleet_no: "BVTR26", manufacturer: "MASSEY FERGUSEN", model: "268", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "265", engine_no: "816506" },
  { location: "BURMA ESTATE", fleet_no: "GS4", manufacturer: "GENERATOR", model: "GENERATOR", asset_group: "GENERATOR", asset_type: "GENERATOR", powered_by: "DIESEL" },
  { location: "BURMA ESTATE", fleet_no: "BVTR4", manufacturer: "LANDINI", model: "LANDINI 75 CAB", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "TL22N/K (R5860)", engine_no: "5368F24211" },
  { location: "BURMA ESTATE", fleet_no: "BVTR23", manufacturer: "NEW HOLLAND", model: "TT55", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "NH12435775" },
  { location: "BURMA ESTATE", fleet_no: "BVTR21", manufacturer: "LANDINI", model: "LANDINI 60", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "TL22N/K(R6860)", engine_no: "5365E45153" },
  { location: "BURMA ESTATE", fleet_no: "BE1", manufacturer: "ISUZU", model: "F5000", asset_group: "TRUCK RIGID", asset_type: "CARGO VAN HV", powered_by: "DIESEL" },
  { location: "BURMA ESTATE", fleet_no: "BEC", manufacturer: "UNKNOWN MAKE", model: "UNKNOWN MODEL", asset_group: "CRUSHER", asset_type: "MOBILE CRUSHER", powered_by: "PETROL UNLEADED" },
  { location: "BURMA VALLEY FARM", fleet_no: "RCH", manufacturer: "UNKNOWN MAKE", model: "UNKNOWN MODEL", asset_group: "UNKNOWN LV GROUP", asset_type: "UNKNOWN LV TYPE", powered_by: "DIESEL" },
  { location: "BURMA VALLEY FARM", fleet_no: "BEP1", manufacturer: "UNKNOWN MAKE", model: "UNKNOWN MODEL", asset_group: "UNKNOWN LV GROUP", asset_type: "UNKNOWN LV TYPE", powered_by: "DIESEL" },
  { location: "BURMA VALLEY FARM", fleet_no: "GENSET5", manufacturer: "GENERATOR", model: "GENERATOR", asset_group: "GENERATOR", asset_type: "GENERATOR", powered_by: "DIESEL" },
  { location: "BURMA VALLEY FARM", fleet_no: "BVTR1", manufacturer: "NEW HOLLAND", model: "TD95", asset_group: "TRACTOR EW", asset_type: "TRACTOR", powered_by: "DIESEL", chassis_no: "2000/2513/00/00600", engine_no: "684640" },
  { location: "FANGUDU", fleet_no: "FL1", manufacturer: "TOYOTA", model: "FORKLIFT", asset_group: "FORKLIFT", asset_type: "FRONT FORKLIFT", powered_by: "DIESEL" },
  { location: "FANGUDU", fleet_no: "BVTR20", manufacturer: "LANDINI", model: "LANDINI 85 CAB", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "TL23DT/M(DT8860)", engine_no: "5377H25164" },
  { location: "FANGUDU", fleet_no: "BVTR22", manufacturer: "NEW HOLLAND", model: "TT55", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "NH2439757", engine_no: "239171DT" },
  { location: "MATANUSKA FARM", fleet_no: "FL2", manufacturer: "TOYOTA", model: "FORKLIFT", asset_group: "FORKLIFT", asset_type: "FRONT FORKLIFT", powered_by: "DIESEL" },
  { location: "MATANUSKA FARM", fleet_no: "FL4", manufacturer: "TOYOTA", model: "FORKLIFT", asset_group: "FORKLIFT", asset_type: "FRONT FORKLIFT", powered_by: "DIESEL" },
  { location: "MATANUSKA FARM", fleet_no: "FL6", manufacturer: "TOYOTA", model: "FORKLIFT", asset_group: "FORKLIFT", asset_type: "FRONT FORKLIFT", powered_by: "DIESEL" },
  { location: "MATANUSKA FARM", fleet_no: "FL7", manufacturer: "TOYOTA", model: "FORKLIFT", asset_group: "FORKLIFT", asset_type: "FRONT FORKLIFT", powered_by: "DIESEL" },
  { location: "MATANUSKA FARM", fleet_no: "GS1", manufacturer: "VOLVO", model: "PENTA GENERATOR", asset_group: "GENERATOR", asset_type: "GENERATOR", powered_by: "DIESEL" },
  { location: "MATANUSKA FARM", fleet_no: "GS2", manufacturer: "CUMMINS", model: "C110 GENSET", asset_group: "GENERATOR", asset_type: "GENERATOR", powered_by: "DIESEL" },
  { location: "MATANUSKA FARM", fleet_no: "BVTR2", manufacturer: "LANDINI", model: "LANDINI 75 CAB", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "TLNL/AA", engine_no: "TLNLN18165" },
  { location: "MATANUSKA FARM", fleet_no: "BVTR19", manufacturer: "LANDINI", model: "LANDINI 85 CAB", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "TL23DT/M(DT8860)", engine_no: "5377D30211" },
  { location: "MATANUSKA FARM", fleet_no: "BVTR9", manufacturer: "JOHN DEERE", model: "5076EN", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "IPY5065EMGP021381", engine_no: "PY3029T252219" },
  { location: "MATANUSKA FARM", fleet_no: "BVTR11", manufacturer: "NEW HOLLAND", model: "TD95", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "2000/2513/00/006000", engine_no: "458528" },
  { location: "MATANUSKA FARM", fleet_no: "BVTR16", manufacturer: "NEW HOLLAND", model: "TT55", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "NM8435771", engine_no: "236627DT" },
  { location: "MATANUSKA FARM", fleet_no: "BVTR25", manufacturer: "NEW HOLLAND", model: "TT55", asset_group: "TRACTOR MH", asset_type: "STANDARD TRACTOR", powered_by: "DIESEL", chassis_no: "NH2439761", engine_no: "2391177DT" }
]

async function importAssets() {
  console.log(`Starting import of ${assetsData.length} assets...`)
  
  // First, let's check what columns exist in the assets table
  console.log('Checking assets table structure...')
  const { data: testInsert, error: testError } = await supabase
    .from('assets')
    .select('*')
    .limit(1)
  
  if (testError) {
    console.error('Error accessing assets table:', testError.message)
    console.log('The assets table may not exist. Please run migrations first.')
    return
  }
  
  console.log('Assets table accessible. Sample structure:', testInsert.length ? Object.keys(testInsert[0]) : 'empty table')
  
  // Transform data to match database schema (absolute minimum required fields)
  const assets = assetsData.map(asset => ({
    name: `${asset.manufacturer} ${asset.model} (${asset.fleet_no})`.trim(),
    type: (asset.asset_type || asset.asset_group).trim()
  }))

  // Insert in batches of 10
  const batchSize = 10
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < assets.length; i += batchSize) {
    const batch = assets.slice(i, i + batchSize)
    
    const { data, error } = await supabase
      .from('assets')
      .insert(batch)
      .select()

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message)
      errorCount += batch.length
    } else {
      console.log(`✓ Batch ${i / batchSize + 1} inserted: ${data?.length} assets`)
      successCount += data?.length || 0
    }
  }

  console.log(`\n========================================`)
  console.log(`Import Complete!`)
  console.log(`✅ Success: ${successCount} assets`)
  console.log(`❌ Errors: ${errorCount} assets`)
  console.log(`========================================`)
}

importAssets()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
