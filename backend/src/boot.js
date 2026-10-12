module.exports = (app) => {
  async function start(port) {
    try {
      try {
        await app.db.authenticate();
        await app.db.sync();
        console.log("Conexão com banco de dados estabelecida com sucesso!");

        // Registra a Trigger automaticamente após o sync das tabelas
        await app.db.query(`DROP TRIGGER IF EXISTS trg_gerar_slug_usuario;`);
        await app.db.query(`
          CREATE TRIGGER trg_gerar_slug_usuario
          BEFORE INSERT ON Usuarios
          FOR EACH ROW
          BEGIN
              DECLARE base_slug VARCHAR(255);
              DECLARE final_slug VARCHAR(255);
              DECLARE cont INT DEFAULT 1;

              IF NEW.slug IS NULL OR NEW.slug = '' THEN
                  SET base_slug = LOWER(TRIM(NEW.nome));
                  
                  -- Remove acentos e caracteres especiais comuns
                  SET base_slug = REPLACE(base_slug, 'á', 'a');
                  SET base_slug = REPLACE(base_slug, 'à', 'a');
                  SET base_slug = REPLACE(base_slug, 'ã', 'a');
                  SET base_slug = REPLACE(base_slug, 'â', 'a');
                  SET base_slug = REPLACE(base_slug, 'é', 'e');
                  SET base_slug = REPLACE(base_slug, 'ê', 'e');
                  SET base_slug = REPLACE(base_slug, 'í', 'i');
                  SET base_slug = REPLACE(base_slug, 'ó', 'o');
                  SET base_slug = REPLACE(base_slug, 'ô', 'o');
                  SET base_slug = REPLACE(base_slug, 'õ', 'o');
                  SET base_slug = REPLACE(base_slug, 'ú', 'u');
                  SET base_slug = REPLACE(base_slug, 'ü', 'u');
                  SET base_slug = REPLACE(base_slug, 'ç', 'c');
                  SET base_slug = REPLACE(base_slug, '.', '');
                  SET base_slug = REPLACE(base_slug, ',', '');
                  SET base_slug = REPLACE(base_slug, '/', '');
                  SET base_slug = REPLACE(base_slug, '_', '-');
                  SET base_slug = REPLACE(base_slug, ' ', '-');

                  -- Remove hífens duplicados
                  WHILE INSTR(base_slug, '--') > 0 DO
                      SET base_slug = REPLACE(base_slug, '--', '-');
                  END WHILE;

                  IF base_slug = '' OR base_slug IS NULL THEN
                      SET base_slug = 'usuario';
                  END IF;

                  SET final_slug = base_slug;

                  -- Garante unicidade incrementando sufixo
                  WHILE EXISTS (SELECT 1 FROM Usuarios WHERE slug = final_slug) DO
                      SET final_slug = CONCAT(base_slug, '-', cont);
                      SET cont = cont + 1;
                  END WHILE;

                  SET NEW.slug = final_slug;
              END IF;
          END;
        `);
        console.log("Trigger 'trg_gerar_slug_usuario' registrada com sucesso!");

      } catch (err) {
        console.log("Erro na conexão com o banco de dados!");
        console.error(err);
      }

      app.listen(port, () => {
        console.log(`Aplicação rodando na porta ${port}`);
      });
    } catch (err) {
      console.log("Erro de conexão");
      console.error(err);
    }
  }

  start(app.get("port"));
};