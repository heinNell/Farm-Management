#!/usr/bin/env node

/**
 * Script to fix the fuel_records table structure
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function fixFuelRecordsTable() {
  console.log('🔧 Checking fuel_records table structure...\n')

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('fuel_records')
      .select('*')
      .limit(1)

    if (error) {
      console.log('❌ Error querying fuel_records:', error.message)
      console.log('\n📝 The table needs to be fixed. Run this SQL in Supabase SQL Editor:\n')
      console.log('-- Add missing date column')
      console.log('ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ NOT NULL DEFAULT NOW();\n')
      console.log('-- Add missing created_at column')
      console.log('ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();\n')
      console.log('-- Add missing updated_at column')
      console.log('ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();\n')
    } else {
      console.log('✅ fuel_records table is accessible')
      console.log('📊 Current records:', data?.length || 0)
    }

    // Check assets table
    console.log('\n🔧 Checking assets table...')
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, name')
      .limit(5)

    if (assetsError) {
      console.log('❌ Error querying assets:', assetsError.message)
    } else {
      console.log('✅ Assets table OK -', assets?.length || 0, 'records found')
      if (assets && assets.length > 0) {
        console.log('Sample assets:', assets.map(a => a.name).join(', '))
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

fixFuelRecordsTable()
