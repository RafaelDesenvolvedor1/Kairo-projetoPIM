import { Empty, Spin } from "antd";
import { PacienteCard, PacientesGrid } from "./styles";
import { UserOutlined } from "@ant-design/icons";

export default function ViewPacientes({ 
  lancamentos, 
  pacientes,
  loading,
  onPacienteClick 
}) {
  // Agrupar lançamentos por paciente
  const lancamentosPorPaciente = {};
  
  pacientes.forEach(p => {
    lancamentosPorPaciente[p.id] = {
      paciente: p,
      totalReceita: 0,
      totalDespesa: 0,
      lançamentos: []
    };
  });

  lancamentos.forEach(l => {
    if (l.id_paciente && lancamentosPorPaciente[l.id_paciente]) {
      lancamentosPorPaciente[l.id_paciente].lançamentos.push(l);
      
      if (l.tipo === "RECEITA") {
        lancamentosPorPaciente[l.id_paciente].totalReceita += parseFloat(l.valor || 0);
      } else {
        lancamentosPorPaciente[l.id_paciente].totalDespesa += parseFloat(l.valor || 0);
      }
    }
  });

  const pacientesComDados = Object.values(lancamentosPorPaciente).filter(
    p => p.lançamentos.length > 0
  );

  if (loading) {
    return <Spin style={{ display: "flex", justifyContent: "center", padding: "48px" }} />;
  }

  if (pacientesComDados.length === 0) {
    return <Empty description="Nenhum paciente com lançamentos" />;
  }

  return (
    <PacientesGrid>
      {pacientesComDados.map(item => (
        <PacienteCard
          key={item.paciente.id}
          onClick={() => onPacienteClick(item.paciente.id)}
          clickable
        >
          <div className="header">
            <div className="avatar">
              <UserOutlined />
            </div>
            <div className="info">
              <h3>{item.paciente.nomePaciente}</h3>
              <p className="email">{item.paciente.email}</p>
            </div>
          </div>

          <div className="valores">
            <div className="valor-box receita">
              <span className="label">Receita</span>
              <span className="amount">
                R$ {item.totalReceita.toLocaleString("pt-BR", { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>

            <div className="valor-box despesa">
              <span className="label">Despesa</span>
              <span className="amount">
                R$ {item.totalDespesa.toLocaleString("pt-BR", { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          </div>

          <div className="rodape">
            <small>{item.lançamentos.length} lançamento(s)</small>
          </div>
        </PacienteCard>
      ))}
    </PacientesGrid>
  );
}
