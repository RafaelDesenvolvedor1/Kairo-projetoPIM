import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ConfigProvider, Spin } from "antd";
import "antd/dist/reset.css";

import { createBrowserRouter, RouterProvider } from "react-router";

// 1. Rota crítica inicial de autenticação: import estático/imediato
import Login from "./routes/Login/index.jsx";

// 2. Componentes auxiliares de layout e proteção
import ProtectedRoute from "./components/ProtectedRoute/index.jsx";
import { MessageProvider } from "./context/MessageProvider";

// 3. Demais rotas carregadas sob demanda (Code-Splitting)
const Home = lazy(() => import("./routes/Home/Home.jsx"));
const Pacientes = lazy(() => import("./routes/Pacientes/Pacientes.jsx"));
const PacientesDates = lazy(() => import("./routes/PacientesDates/index.jsx"));
const Financeiro = lazy(() => import("./routes/Financeiro/index.jsx"));
const Agendamentos = lazy(() => import("./routes/Agendamentos/index.jsx"));
const Locais = lazy(() => import("./routes/Locais/index.jsx"));
const Servicos = lazy(() => import("./routes/Servicos/index.jsx"));
const Horarios = lazy(() => import("./routes/Horarios/index.jsx"));
const Cadastro = lazy(() => import("./routes/Cadastro/index.jsx"));
const PublicProfile = lazy(() => import("./routes/PublicProfile/index.jsx"));

// Fallback visual centralizado durante a transição de telas lazy
const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
      width: "100%",
    }}
  >
    <Spin size="large" />
  </div>
);

// Wrapper reutilizável para injetar Suspense em rotas lazy
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: withSuspense(Home),
      },
      {
        path: "pacientes",
        element: withSuspense(Pacientes),
      },
      {
        path: "pacientes/dates",
        element: withSuspense(PacientesDates),
      },
      {
        path: "financeiro",
        element: withSuspense(Financeiro),
      },
      {
        path: "agendamentos",
        element: withSuspense(Agendamentos),
      },
      {
        path: "locais",
        element: withSuspense(Locais),
      },
      {
        path: "servicos",
        element: withSuspense(Servicos),
      },
      {
        path: "horarios",
        element: withSuspense(Horarios),
      },
    ],
  },
  {
    path: "/p/:slug",
    element: withSuspense(PublicProfile),
  },
  {
    path: "/login",
    element: <Login />, // Carrega instantaneamente sem Suspense extra
  },
  {
    path: "/cadastro",
    element: withSuspense(Cadastro),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {},
        components: {
          Message: {
            colorBgElevated: "#1f1f1f",
            colorText: "#fff",
            colorSuccess: "#4caf50",
            colorError: "#ff5252",
          },
        },
      }}
    >
      <MessageProvider>
        <RouterProvider router={router} />
      </MessageProvider>
    </ConfigProvider>
  </StrictMode>
);