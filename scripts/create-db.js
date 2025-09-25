const fs = require('fs')
const path = require('path')

// Script simples para criar o banco SQLite
function createDatabase() {
  console.log('🔄 Creating database...')
  
  // Ler arquivo de migração
  const migrationPath = path.join(__dirname, '../src/lib/database/migrations/001_initial_schema.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
  
  // Salvar SQL em arquivo temporário
  const tempSQLPath = path.join(__dirname, 'temp_schema.sql')
  fs.writeFileSync(tempSQLPath, migrationSQL)
  
  console.log('✅ SQL file created at:', tempSQLPath)
  console.log('📋 To create the database:')
  console.log('1. Download SQLite Browser: https://sqlitebrowser.org/')
  console.log('2. Create new database: sky-travels.db')
  console.log('3. Execute SQL from:', tempSQLPath)
  console.log('4. Or use command line: sqlite3 sky-travels.db < ' + tempSQLPath)
}

createDatabase()
