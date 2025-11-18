// electron-backend/database/sqlite_handler.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./clinica.db'); // O banco de dados persistente

// Função de inicialização: cria a tabela se não existir
function initDatabase() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS pacientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                telefone TEXT,
                email TEXT NOT NULL
            )
        `);
    });
    console.log("Tabela 'pacientes' verificada e pronta.");
}

// Lógica de consulta (SELECT ALL)
async function getPacientes() {
    return new Promise((resolve, reject) => {
        // SQL para selecionar todos os pacientes
        db.all("SELECT * FROM pacientes ORDER BY nome", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// Lógica de inserção (INSERT)
async function savePaciente(paciente) {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO pacientes (nome, telefone, email) VALUES (?, ?, ?)`;
        
        db.run(sql, [paciente.nome, paciente.telefone, paciente.email], function(err) {
            if (err) return reject(err);
            // Retorna o paciente recém-criado com o ID gerado
            resolve({ 
                id: this.lastID, 
                nome: paciente.nome, 
                telefone: paciente.telefone, 
                email: paciente.email 
            });
        });
    });
}

// 3. UPDATE
async function updatePaciente(paciente) {
    return new Promise((resolve, reject) => {
        // ATENÇÃO: Se o nome da coluna no DB for 'nome' e o objeto React enviar 'nomePaciente', 
        // a atualização falhará. Usamos 'nome' aqui para bater com o DB.
        const sql = `UPDATE pacientes SET nome = ?, telefone = ?, email = ? WHERE id = ?`;
        
        db.run(sql, [paciente.nome, paciente.telefone, paciente.email, paciente.id], function(err) {
            if (err) return reject(err);
            resolve(paciente); // Retorna o objeto atualizado
        });
    });
}

// 4. DELETE
async function removePaciente(id) {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM pacientes WHERE id = ?", id, function(err) {
            if (err) return reject(err);
            resolve({ deletedID: id });
        });
    });
}

module.exports = { initDatabase, getPacientes, savePaciente, updatePaciente, removePaciente };