import cep from 'cep-promise';

const cepService = {
  async buscarEnderecoPorCep(cepInput) {
    try {
      // O cep-promise aceita string com ou sem máscara/hífen
      const dados = await cep(cepInput);

      return {
        sucesso: true,
        dados: {
          endereco: dados.street || '',
          bairro: dados.neighborhood || '',
          cidade: dados.city || '',
          estado: dados.state || '',
          complemento: '',
        },
      };
    } catch (error) {
      console.error('Erro ao consultar CEP via cep-promise:', error);
      
      return {
        sucesso: false,
        mensagem: error.type === 'service_error' 
          ? 'CEP não encontrado nas bases de dados.' 
          : 'Não foi possível consultar o CEP no momento.',
      };
    }
  },
};

export default cepService;