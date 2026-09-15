const { z } = require('zod');

// Schema para criação de Serviço (POST)
const criarServicoSchema = z.object({
  nome: z
    .string({ required_error: 'O nome do serviço é obrigatório.' })
    .trim()
    .min(3, 'O nome do serviço deve ter no mínimo 3 caracteres.')
    .max(100, 'O nome do serviço deve ter no máximo 100 caracteres.'),
  modalidade: z.enum(['Presencial', 'Online', 'Híbrido'], {
    errorMap: () => ({
      message: 'A modalidade deve ser "Presencial", "Online" ou "Híbrido".',
    }),
  }).default('Presencial'),
  agendamento: z
    .any()
    .transform((val) => (val ? String(val).trim() : null))
    .refine((val) => !val || val.length <= 100, {
      message: 'O tipo/regra de agendamento deve ter no máximo 100 caracteres.',
    })
    .nullable()
    .optional(),
  ativo: z.boolean().default(true),
});

// Schema para atualização de Serviço (PUT)
const atualizarServicoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'O nome do serviço deve ter no mínimo 3 caracteres.')
    .max(100, 'O nome do serviço deve ter no máximo 100 caracteres.')
    .optional(),
  modalidade: z
    .enum(['Presencial', 'Online', 'Híbrido'], {
      errorMap: () => ({
        message: 'A modalidade deve ser "Presencial", "Online" ou "Híbrido".',
      }),
    })
    .optional(),
  agendamento: z
    .any()
    .transform((val) => (val ? String(val).trim() : null))
    .refine((val) => !val || val.length <= 100, {
      message: 'O tipo/regra de agendamento deve ter no máximo 100 caracteres.',
    })
    .nullable()
    .optional(),
  ativo: z.boolean().optional(),
});

// Middleware com fallback seguro de issues
const validar = (schema) => (req, res, next) => {
  const resultado = schema.safeParse(req.body);

  if (!resultado.success) {
    const issues = resultado.error?.issues || resultado.error?.errors || [];

    const erros = issues.map((err) => ({
      campo: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
      mensagem: err.message,
    }));

    return res.status(400).json({ sucesso: false, erros });
  }

  req.body = resultado.data;
  return next();
};

module.exports = {
  criarServicoSchema,
  atualizarServicoSchema,
  validarCriacaoServico: validar(criarServicoSchema),
  validarAtualizacaoServico: validar(atualizarServicoSchema),
};