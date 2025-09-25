const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const path = require('path')

// Executar migrações do banco de dados
function runMigrations() {
  console.log('🔄 Running database migrations...')

  // Conectar ao banco
  const db = new sqlite3.Database('sky-travels.db')
  
  // Ler arquivo de migração
  const migrationPath = path.join(__dirname, '../src/lib/database/migrations/001_initial_schema.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
  
  // Executar migração
  db.exec(migrationSQL, (err) => {
    if (err) {
      console.error('❌ Migration failed:', err)
      process.exit(1)
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Verificar tabelas criadas
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('❌ Error checking tables:', err)
      } else {
        console.log('📊 Tables created:', tables.map(t => t.name).join(', '))
      }
      
      // Fechar conexão
      db.close()
    })
  })
}

// Executar se chamado diretamente
if (require.main === module) {
  runMigrations()
}

module.exports = { runMigrations }
