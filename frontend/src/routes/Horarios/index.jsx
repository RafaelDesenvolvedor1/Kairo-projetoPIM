import React, { useState, useEffect } from 'react';
import { Typography, Form, Space, TimePicker, Select, Button, Popconfirm, message, Divider, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import MyDrawer from '../../components/MyDrawer';
import ButtonSubmit from '../../components/ButtonSubmit';
import CardDia from '../../components/CardDia';
import ButtonPrimary from '../../components/ButtonPrimary';
import horariosService from '../../services/horariosService';
import locaisService from '../../services/locaisService';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const diasSemana = [
  'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo'
];

export default () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState('');
  const [form] = Form.useForm();
  
  const [horarios, setHorarios] = useState([]);
  const [locais, setLocais] = useState([]);
  const [editingHorario, setEditingHorario] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    
    const [horariosRes, locaisRes] = await Promise.all([
      horariosService.getHorarios(),
      locaisService.getLocais(),
    ]);

    if (horariosRes.success) {
      setHorarios(horariosRes.data.map(h => ({ ...h, id: h.id_horario })));
    } else {
      message.error('Falha ao carregar horários');
    }

    if (locaisRes.success) {
      setLocais(locaisRes.data.map(l => ({ ...l, id: l.id_local })));
    } else {
      message.error('Falha ao carregar locais');
    }

    setLoading(false);
  };

  const handleOpenDrawer = (dia) => {
    setDiaSelecionado(dia);
    setEditingHorario(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleEdit = (horario) => {
    setDiaSelecionado(horario.dia_semana);
    setEditingHorario(horario);
    form.setFieldsValue({
      intervalo: [
        dayjs(horario.hora_inicio, 'HH:mm'),
        dayjs(horario.hora_fim, 'HH:mm'),
      ],
      local: horario.id_local,
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    const response = await horariosService.deleteHorario(id);
    if (response.success) {
      setHorarios((prev) => prev.filter((h) => h.id !== id));
      message.success('Horário excluído');
    } else {
      message.error(response.message || 'Erro ao excluir');
    }
    setLoading(false);
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      if (!values.intervalo || values.intervalo.length !== 2) {
        message.error('Selecione um horário válido');
        setLoading(false);
        return;
      }

      const payload = {
        dia_semana: diaSelecionado,
        hora_inicio: values.intervalo[0].format('HH:mm'),
        hora_fim: values.intervalo[1].format('HH:mm'),
        id_local: values.local,
        ativo: true,
      };

      if (editingHorario) {
        const response = await horariosService.updateHorario(editingHorario.id, payload);
        if (!response.success) throw new Error(response.message);
        setHorarios((prev) =>
          prev.map((h) => (h.id === editingHorario.id ? { ...response.data, id: response.data.id_horario } : h))
        );
        message.success('Horário atualizado');
      } else {
        const response = await horariosService.createHorario(payload);
        if (!response.success) throw new Error(response.message);
        setHorarios((prev) => [...prev, { ...response.data, id: response.data.id_horario }]);
        message.success('Horário cadastrado');
      }

      setIsDrawerOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || 'Erro ao salvar');
    }
    setLoading(false);
  };

  const horariosParaDia = (dia) => horarios.filter((h) => h.dia_semana === dia);
  const getLocalNome = (id_local) => {
    const local = locais.find((l) => l.id === id_local);
    return local ? local.nome : 'N/A';
  };

  return (
    <div style={{ flex: 1 }}>
      <Space direction="vertical" style={{ width: '100%', padding: '24px' }}>
        <header style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#001529' }}>Horário de Atendimento</Title>
          <Paragraph type="secondary">
            Cadastre sua disponibilidade, locais e horários para a agenda.
          </Paragraph>
        </header>

        {/* Lista de dias conforme o mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {diasSemana.map((dia) => (
            <div key={dia}>
              <CardDia
                dia={dia}
                onAdd={() => handleOpenDrawer(dia)}
              />
              
              {/* Exibe horários cadastrados para este dia */}
              {horariosParaDia(dia).length > 0 && (
                <div style={{ marginLeft: '16px', marginTop: '8px', marginBottom: '16px' }}>
                  {horariosParaDia(dia).map((horario) => (
                    <div
                      key={horario.id}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 'bold' }}>
                          {horario.hora_inicio} - {horario.hora_fim}
                        </span>
                        <span style={{ marginLeft: '16px', color: '#666' }}>
                          📍 {getLocalNome(horario.id_local)}
                        </span>
                      </div>
                      <Space>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(horario)}
                        />
                        <Popconfirm
                          title="Excluir este horário?"
                          onConfirm={() => handleDelete(horario.id)}
                          okText="Sim"
                          cancelText="Não"
                        >
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Space>

      <MyDrawer
        title={`Configurar ${diaSelecionado}${editingHorario ? ' (Editar)' : ''}`}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingHorario(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="intervalo"
            label="Período de Atendimento"
            rules={[{ required: true, message: 'Selecione o horário' }]}
          >
            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item
            name="local"
            label="Local de Atendimento"
            rules={[{ required: true, message: 'Selecione um local' }]}
          >
            <Select placeholder="Selecione o local" size="large">
              {locais.length > 0 ? (
                locais.map((local) => (
                  <Option key={local.id} value={local.id}>
                    {local.nome}
                    {local.is_video && ' (Online)'}
                  </Option>
                ))
              ) : (
                <Option disabled>Nenhum local cadastrado</Option>
              )}
            </Select>
          </Form.Item>

          <div style={{ marginTop: '40px' }}>
            <ButtonSubmit>
              {editingHorario ? 'Atualizar Horário' : 'Salvar Horário'}
            </ButtonSubmit>
          </div>
        </Form>
      </MyDrawer>
    </div>
  );
};
