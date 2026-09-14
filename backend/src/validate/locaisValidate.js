const { z } = require('zod');

// Schema individual do endereço
const enderecoBaseSchema = z.object({
  cep: z
    .any()
    .transform((val) => (val ? String(val).replace(/\D/g, '') : ''))
    .refine((val) => val.length === 8, {
      message: 'O CEP deve conter exatamente 8 dígitos numéricos.',
    }),
  logradouro: z
    .string({ required_error: 'O logradouro/rua é obrigatório.' })
    .trim()
    .min(3, 'O logradouro deve ter no mínimo 3 caracteres.')
    .max(150, 'O logradouro deve ter no máximo 150 caracteres.'),
  numero: z
    .any()
    .transform((val) => (val !== undefined && val !== null ? String(val).trim() : ''))
    .refine((val) => val.length >= 1, {
      message: 'O número é obrigatório.',
    })
    .refine((val) => val.length <= 20, {
      message: 'O número deve ter no máximo 20 caracteres.',
    }),
  complemento: z
    .any()
    .transform((val) => (val ? String(val).trim() : null))
    .refine((val) => !val || val.length <= 100, {
      message: 'O complemento deve ter no máximo 100 caracteres.',
    })
    .nullable()
    .optional(),
  bairro: z
    .string({ required_error: 'O bairro é obrigatório.' })
    .trim()
    .min(2, 'O bairro deve ter no mínimo 2 caracteres.')
    .max(100, 'O bairro deve ter no máximo 100 caracteres.'),
  cidade: z
    .string({ required_error: 'A cidade é obrigatória.' })
    .trim()
    .min(2, 'A cidade deve ter no mínimo 2 caracteres.')
    .max(100, 'A cidade deve ter no máximo 100 caracteres.'),
  estado: z
    .string({ required_error: 'A UF é obrigatória.' })
    .trim()
    .length(2, 'A UF deve conter exatamente 2 letras (ex: SP).')
    .toUpperCase(),
});

// Schema para criação de Local (POST)
const criarLocalSchema = z
  .object({
    nome: z
      .string({ required_error: 'O nome do local é obrigatório.' })
      .trim()
      .min(3, 'O nome do local deve ter no mínimo 3 caracteres.')
      .max(100, 'O nome do local deve ter no máximo 100 caracteres.'),
    is_video: z.boolean().default(false),
    ativo: z.boolean().default(true),
    endereco: enderecoBaseSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.is_video) {
      if (!data.endereco || typeof data.endereco !== 'object') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'O endereço é obrigatório para atendimento presencial.',
          path: ['endereco'],
        });
      }
    }
  });

// Schema para atualização de Local (PUT)
const atualizarLocalSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, 'O nome do local deve ter no mínimo 3 caracteres.')
      .max(100, 'O nome do local deve ter no máximo 100 caracteres.')
      .optional(),
    is_video: z.boolean().optional(),
    ativo: z.boolean().optional(),
    endereco: enderecoBaseSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_video === false && data.endereco === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'O endereço não pode ser nulo para atendimento presencial.',
        path: ['endereco'],
      });
    }
  });

// Middleware com fallback seguro
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
  criarLocalSchema,
  atualizarLocalSchema,
  validarCriacaoLocal: validar(criarLocalSchema),
  validarAtualizacaoLocal: validar(atualizarLocalSchema),
};