const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
})

async function verifyMigration() {
  const client = await pool.connect()
  
  try {
    console.log('🔍 Verifying user migration...\n')
    
    // Check User table new columns
    const userColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('profilePicture', 'bannerImage', 'location', 'website')
    `)
    console.log('✅ User table columns:', userColumns.rows.length === 4 ? '✓ All 4 new columns added' : `⚠️ Only ${userColumns.rows.length}/4 columns found`)
    userColumns.rows.forEach(col => console.log(`   - ${col.column_name}`))
    
    // Check new tables
    const tables = ['Follow', 'Conversation', 'Message']
    console.log('\n📊 Checking new tables:')
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table])
      if (result.rows[0].exists) {
        // Get row count
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table}"`)
        console.log(`✅ Table "${table}": Created (${countResult.rows[0].count} rows)`)
      } else {
        console.log(`❌ Table "${table}": Missing`)
      }
    }
    
    // Check indexes
    const indexes = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('Follow', 'Conversation', 'Message')
      AND indexname LIKE 'idx_%'
    `)
    console.log(`\n✅ Indexes created: ${indexes.rows.length}`)
    indexes.rows.forEach(idx => console.log(`   - ${idx.indexname}`))
    
    console.log('\n✅ Migration verification complete!')
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

verifyMigration()

