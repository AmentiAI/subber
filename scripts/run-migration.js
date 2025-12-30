const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
})

async function runMigration(migrationFile) {
  const client = await pool.connect()
  
  try {
    const migrationPath = migrationFile 
      ? path.join(__dirname, '..', migrationFile)
      : path.join(__dirname, '../lib/migrations.sql')
    
    console.log('📦 Reading migration file:', migrationPath)
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('🚀 Running migration...')
    
    // Execute the entire migration as one transaction
    try {
      await client.query('BEGIN')
      
      // Execute all statements
      await client.query(migrationSQL)
      
      await client.query('COMMIT')
      console.log('✅ All migration statements executed successfully!')
    } catch (error) {
      await client.query('ROLLBACK')
      
      // If it's a transaction error, try executing statements individually
      if (error.message.includes('syntax error') || error.message.includes('transaction')) {
        console.log('⚠️  Transaction failed, trying individual statements...')
        
        // Split by semicolons and execute each statement
        const statements = migrationSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'))
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await client.query(statement + ';')
              console.log('✅ Executed:', statement.substring(0, 60).replace(/\n/g, ' ') + '...')
            } catch (err) {
              // Ignore "already exists" and "does not exist" errors for IF NOT EXISTS
              if (err.message.includes('already exists') || 
                  err.message.includes('duplicate') ||
                  err.message.includes('does not exist') && statement.includes('IF NOT EXISTS')) {
                console.log('⚠️  Skipped:', err.message.substring(0, 60))
              } else {
                console.error('❌ Error:', err.message.substring(0, 100))
              }
            }
          }
        }
      } else {
        throw error
      }
    }
    
    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

// Get migration file from command line argument or use default
const migrationFile = process.argv[2] || null
runMigration(migrationFile)

