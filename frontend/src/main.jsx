import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ConfigProvider } from "antd";

import "antd/dist/reset.css";


import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./routes/Home/Home.jsx";
import Pacientes from "./routes/Pacientes/Pacientes.jsx";
import Financeiro from "./routes/Financeiro/index.jsx";
import Agendamentos from "./routes/Agendamentos/index.jsx";
import Login from "./routes/Login/index.jsx";
import Cadastro from "./routes/Cadastro/index.jsx";
import Locais from "./routes/Locais/index.jsx";
import Servicos from "./routes/Servicos/index.jsx";
import Horarios from "./routes/Horarios/index.jsx";
import PacientesDates from "./routes/PacientesDates/index.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "pacientes",
          element: <Pacientes />
        },
        {
          path: "pacientes/dates",
          element: <PacientesDates />
        },
        {
          path: "financeiro",
          element: <Financeiro />
        },
        {
          path: "agendamentos",
          element: <Agendamentos />
        },
        {
          path: "locais",
          element: <Locais />
        },
        {
          path: "servicos",
          element: <Servicos />
        },
        {
          path: "horarios",
          element: <Horarios />
        }
      ],
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/cadastro",
      element: <Cadastro />
    },
  ]
);


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider theme={{
      token: {

      },
      components: {
        Message: {
          colorBgElevated: "#1f1f1f",   // fundo
          colorText: "#fff",           // texto
          colorSuccess: "#4caf50",     // cor da barra do sucesso
          colorError: "#ff5252",       // erro
        },
      },
    }}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>
);
