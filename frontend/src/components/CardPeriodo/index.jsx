import { Button, Space, Select } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { CardPeriodoContainer } from "./styles";

dayjs.locale("pt-br");

export default function CardPeriodo({ periodo, onPeriodoChange }) {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const [ano, mes] = periodo.split("-");
  const mesIndex = parseInt(mes) - 1;

  const mesAnterior = () => {
    const d = dayjs(`${ano}-${mes}-01`).subtract(1, "month");
    onPeriodoChange(d.format("YYYY-MM"));
  };

  const mesProximo = () => {
    const d = dayjs(`${ano}-${mes}-01`).add(1, "month");
    onPeriodoChange(d.format("YYYY-MM"));
  };

  return (
    <CardPeriodoContainer>
      <Space>
        <Button type="text" icon={<LeftOutlined />} onClick={mesAnterior} />
        <Select
          value={mesIndex}
          onChange={(value) => {
            const novoMes = String(value + 1).padStart(2, "0");
            onPeriodoChange(`${ano}-${novoMes}`);
          }}
          style={{ width: 120 }}
          options={meses.map((m, i) => ({ label: m, value: i }))}
        />
        <Select
          value={parseInt(ano)}
          onChange={(value) => {
            onPeriodoChange(`${value}-${mes}`);
          }}
          style={{ width: 100 }}
          options={Array.from({ length: 10 }, (_, i) => {
            const y = dayjs().year() - 5 + i;
            return { label: y, value: y };
          })}
        />
        <Button type="text" icon={<RightOutlined />} onClick={mesProximo} />
      </Space>
      <span style={{ fontSize: "0.95em", fontWeight: 600 }}>
        {meses[mesIndex]} de {ano}
      </span>
    </CardPeriodoContainer>
  );
}