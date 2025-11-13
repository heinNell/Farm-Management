import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xcaoevypackelcstdieu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYW9ldnlwYWNrZWxjc3RkaWV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkwNTk1NywiZXhwIjoyMDc1NDgxOTU3fQ.IdBkcXFTSlcONLzYvUSN-11UngWbIsYG6xF2rU7XLDY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking assets table structure...\n')
  
  // Get one asset to see the actual columns
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error querying assets:', error)
    return
  }
  
  if (data && data.length > 0) {
    console.log('Columns in assets table:')
    console.log(Object.keys(data[0]).sort())
  } else {
    console.log('No assets found in table')
  }
  
  // Try to get column info from information_schema
  const { data: columns, error: colError } = await supabase
    .rpc('exec_sql', {
      sql: `SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'assets' 
            ORDER BY ordinal_position`
    })
  
  if (!colError && columns) {
    console.log('\nDatabase schema for assets:')
    console.log(columns)
  }
}

checkSchema()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
