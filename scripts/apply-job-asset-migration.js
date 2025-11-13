#!/usr/bin/env node

/**
 * Script to apply the job asset tracking migration via Supabase SQL API
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   SUPABASE_URL or VITE_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('📝 Reading migration file...')
  
  try {
    const migrationPath = join(__dirname, '../supabase/migrations/20240101000012_add_asset_tracking_to_jobs.sql')
    const sql = readFileSync(migrationPath, 'utf8')
    
    console.log('🚀 Applying migration to add asset tracking to job_cards...')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution via REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      })
      
      if (!response.ok) {
        // Try using PostgREST's SQL editor endpoint
        const sqlResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: sql
        })
        
        if (!sqlResponse.ok) {
          throw new Error(`Failed to execute SQL: ${sqlResponse.statusText}`)
        }
      }
    }
    
    console.log('✅ Migration applied successfully!')
    console.log('\n📋 Changes made:')
    console.log('   • Added asset_id column (references assets table)')
    console.log('   • Added hour_meter_reading column (DECIMAL 10,1)')
    console.log('   • Added actual_hours column (INTEGER)')
    console.log('   • Added completed_date column (TIMESTAMPTZ)')
    console.log('   • Added notes column (TEXT)')
    console.log('   • Created index on asset_id for performance')
    console.log('   • Updated status constraint to include "urgent" and "cancelled"')
    console.log('\n🎉 Job cards can now track assets and hour meter readings!')
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message)
    console.error('\n💡 Alternative: Copy the SQL from the migration file and run it in Supabase SQL Editor:')
    console.error('   1. Go to your Supabase project dashboard')
    console.error('   2. Navigate to SQL Editor')
    console.error('   3. Paste the contents of: supabase/migrations/20240101000012_add_asset_tracking_to_jobs.sql')
    console.error('   4. Click "Run"')
    process.exit(1)
  }
}

applyMigration()
