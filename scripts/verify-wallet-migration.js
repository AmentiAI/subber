const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
})

async function verifyMigration() {
  const client = await pool.connect()
  
  try {
    console.log('🔍 Verifying wallet migration...')
    
    // Check if walletAddress column exists
    const columnCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User' AND column_name = 'walletAddress'
    `)
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ walletAddress column exists!')
      console.log('   Type:', columnCheck.rows[0].data_type)
      console.log('   Nullable:', columnCheck.rows[0].is_nullable)
    } else {
      console.log('❌ walletAddress column does NOT exist!')
    }
    
    // Check if index exists
    const indexCheck = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'User' AND indexname = 'idx_user_wallet'
    `)
    
    if (indexCheck.rows.length > 0) {
      console.log('✅ Wallet index exists!')
    } else {
      console.log('⚠️  Wallet index does not exist')
    }
    
    // Check email and password constraints
    const constraintsCheck = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User' AND column_name IN ('email', 'password')
    `)
    
    console.log('\n📋 Column constraints:')
    constraintsCheck.rows.forEach(row => {
      console.log(`   ${row.column_name}: nullable = ${row.is_nullable}`)
    })
    
    console.log('\n✅ Verification complete!')
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

verifyMigration()

