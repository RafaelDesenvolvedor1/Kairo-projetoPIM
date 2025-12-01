import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ConfigProvider } from "antd";

import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./routes/Home/Home.jsx";
import Pacientes from "./routes/Pacientes/Pacientes.jsx";
import Financeiro from "./routes/Financeiro/index.jsx";
import Agendamentos from "./routes/Agendamentos/index.jsx";

const router = createBrowserRouter(
  [
    { 
      path: "/", 
      element: <App />,
      children:[
        {
          path: "/",
          element: <Home />
        },
        {
          path: "pacientes",
          element: <Pacientes />
        },
        {
          path: "financeiro",
          element: <Financeiro />
        },
        {
          path: "agendamentos",
          element: <Agendamentos />
        }
      ] 
    }
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
