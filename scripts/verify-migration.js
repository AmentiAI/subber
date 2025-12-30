const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
})

async function verifyMigration() {
  const client = await pool.connect()
  
  try {
    console.log('🔍 Verifying migration...\n')
    
    // Check Post table for new columns
    const postColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Post' 
      AND column_name IN ('isPinned', 'pinnedAt')
    `)
    console.log('✅ Post table columns:', postColumns.rows.length === 2 ? '✓ isPinned, pinnedAt' : 'Missing some columns')
    
    // Check Community table for new columns
    const communityColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Community' 
      AND column_name IN ('rules', 'guidelines', 'settings', 'themeColor', 'bannerImage')
    `)
    console.log('✅ Community table columns:', communityColumns.rows.length >= 3 ? `✓ ${communityColumns.rows.length} new columns added` : 'Missing some columns')
    
    // Check new tables
    const tables = ['Tag', 'PostTag', 'Report', 'CommunityAnalytics', 'Activity']
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table])
      if (result.rows[0].exists) {
        console.log(`✅ Table "${table}": Created`)
      } else {
        console.log(`❌ Table "${table}": Missing`)
      }
    }
    
    // Check indexes
    const indexes = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('Post', 'Report', 'Activity', 'CommunityAnalytics')
      AND indexname LIKE 'idx_%'
    `)
    console.log(`\n✅ Indexes created: ${indexes.rows.length}`)
    
    console.log('\n✅ Migration verification complete!')
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

verifyMigration()

