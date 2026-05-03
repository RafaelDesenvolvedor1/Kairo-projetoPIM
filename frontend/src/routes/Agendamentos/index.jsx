import React, { useState } from "react";
import { Calendar, Drawer, Form, Input, Button, TimePicker } from "antd";
import dayjs from "dayjs";
import ButtonSubmit from '../../components/ButtonSubmit';
import './style.css'

export default function Agendamentos() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock de eventos (depois isso vem da API)
  const [eventos, setEventos] = useState([
    { date: "2026-03-04", title: "Consulta João" },
    { date: "2026-03-09", title: "Retorno Maria" },
  ]);

  // Clique em um dia do calendário
  const onSelect = (date) => {
    setSelectedDate(date);
    setDrawerOpen(true);
  };

  // Fechar drawer
  const onClose = () => {
    setDrawerOpen(false);
  };

  // Salvar agendamento
  const onFinish = (values) => {
    const novoEvento = {
      date: selectedDate.format("YYYY-MM-DD"),
      time: values.time.format("HH:mm"),
      paciente: values.paciente,
      observacoes: values.observacoes,
    };

    console.log("Novo agendamento:", novoEvento);

    // Atualiza lista de eventos (visual)
    setEventos((prev) => [...prev, novoEvento]);

    setDrawerOpen(false);
  };

  return (
    <>
      <Calendar
        fullscreen
        onSelect={onSelect}
        dateCellRender={(date) => {
          const eventosDoDia = eventos.filter((e) =>
            dayjs(e.date).isSame(date, "day")
          );

          if (eventosDoDia.length === 0) return null;

          return (
            <div className="event-cell">
              {eventosDoDia.map((evento, index) => (
                <div key={index} className="event-item">
                  <span className="dot" />
                  <span className="event-name">
                    {evento.paciente || evento.title}
                  </span>
                </div>
              ))}
            </div>
          );
        }}
      />

      <Drawer
        title={
          selectedDate
            ? `Novo agendamento - ${selectedDate.format("DD/MM/YYYY")}`
            : "Novo agendamento"
        }
        placement="right"
        width={400}
        onClose={onClose}
        open={drawerOpen}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Paciente"
            name="paciente"
            rules={[{ required: true, message: "Informe o paciente" }]}
          >
            <Input placeholder="Nome do paciente" />
          </Form.Item>

          <Form.Item
            label="Horário"
            name="time"
            rules={[{ required: true, message: "Informe o horário" }]}
          >
            <TimePicker
              format="HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item label="Observações" name="observacoes">
            <Input.TextArea rows={3} />
          </Form.Item>

          <ButtonSubmit>
            Salvar
          </ButtonSubmit>
        </Form>
      </Drawer>
    </>
  );
}
