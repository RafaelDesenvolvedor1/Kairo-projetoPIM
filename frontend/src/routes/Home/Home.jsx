import { Space } from "antd";
import { Title } from "../../components/Title";

import CardFastAcess from "../../components/CardFastAcess";

import { FaUserGroup, FaMoneyBillTrendUp, FaCalendar} from "react-icons/fa6";

import { Link } from "react-router";

export default function Home() {
  return (
    <Space direction="vertical">
      <Title>Bem vindo, usuário!</Title>

      <Space direction="horizontal" size={[50] } wrap style={{marginTop:50}}>
        <Link to="/pacientes">
          <CardFastAcess title="Pacientes">
            <FaUserGroup size={50} />
          </CardFastAcess>
        </Link>
        <Link to="/financeiro">
          <CardFastAcess title="Financeiro">
            <FaMoneyBillTrendUp size={50} />
          </CardFastAcess>
        </Link>
        <Link to="/agendamentos">
          <CardFastAcess title="Agendamentos">
            <FaCalendar size={50} />
          </CardFastAcess>
        </Link>
      </Space>
    </Space>
  );
}
