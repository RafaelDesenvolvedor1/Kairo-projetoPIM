const { z } = require('zod');
const { cpf } = require('cpf-cnpj-validator');

// Helper para higienizar strings (converter "" em null)
const sanitizarString = (v) => (v === "" || v === undefined ? null : v);

// Schema base com todas as validações robustas
const pacienteSchema = z.object({
  nomePaciente: z.string({
    required_error: "O nome do paciente é obrigatório",
  })
  .min(3, "O nome deve ter pelo menos 3 caracteres")
  .max(50, "O nome deve ter no máximo 50 caracteres"),
  
  email: z.string({
    required_error: "O e-mail é obrigatório",
  })
  .email("Formato de e-mail inválido")
  .max(50),
  
  telefone: z.string().optional().nullable().transform(sanitizarString),
  
  // Validação real de CPF usando a lib cpf-cnpj-validator
  cpf: z.string()
    .optional()
    .nullable()
    .transform(sanitizarString)
    .refine((val) => !val || cpf.isValid(val), {
      message: "CPF inválido",
    }),

  // Validação de formato para RG (Apenas números, letras e caracteres comuns)
  rg: z.string()
    .optional()
    .nullable()
    .transform(sanitizarString)
    .refine((val) => !val || /^[a-zA-Z0-9.\-\s]{5,20}$/.test(val), {
      message: "RG inválido (deve ter entre 5 e 20 caracteres)",
    }),

  dataNascimento: z.string().optional().nullable().transform(sanitizarString),
  genero: z.string().optional().nullable().transform(sanitizarString),
  profissao: z.string().optional().nullable().transform(sanitizarString),
  estadoCivil: z.string().optional().nullable().transform(sanitizarString),
  
  // Validação de CEP (Aceita 8 dígitos numéricos, ex: 00000000 ou 00000-000)
  cep: z.string()
    .optional()
    .nullable()
    .transform(sanitizarString)
    .refine((val) => !val || /^\d{5}-?\d{3}$/.test(val), {
      message: "CEP inválido. Deve conter 8 dígitos (ex: 00000000 ou 00000-000)",
    }),

  endereco: z.string().optional().nullable().transform(sanitizarString),
  numero: z.string().optional().nullable().transform(sanitizarString),
  complemento: z.string().optional().nullable().transform(sanitizarString),
  bairro: z.string().optional().nullable().transform(sanitizarString),
  cidade: z.string().optional().nullable().transform(sanitizarString),
  estado: z.string().optional().nullable().transform((v) => (v ? v.toUpperCase() : null)),
  
  // Emergência e observações
  contatoEmergenciaNome: z.string().optional().nullable().transform(sanitizarString),
  contatoEmergenciaTelefone: z.string().optional().nullable().transform(sanitizarString),
  observacoes: z.string().optional().nullable().transform(sanitizarString),
});

// Middleware Única: detecta se é PUT/PATCH e aplica .partial() automaticamente
const validarPaciente = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ msg: "Corpo da requisição inválido." });
  }

  // Se for edição (PUT ou PATCH), usa .partial(), senão usa o schema completo
  const schemaAtual = (req.method === 'PUT' || req.method === 'PATCH') 
    ? pacienteSchema.partial() 
    : pacienteSchema;

  const result = schemaAtual.safeParse(req.body);

  if (!result.success) {
    const errosFormatados = result.error.errors.map(err => ({
      campo: err.path[0],
      mensagem: err.message
    }));
    return res.status(400).json({ msg: "Erro de validação", erros: errosFormatados });
  }

  req.body = result.data;
  next();
};

module.exports = { validarPaciente };