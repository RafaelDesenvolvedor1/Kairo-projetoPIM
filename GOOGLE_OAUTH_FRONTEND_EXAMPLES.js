/**
 * Exemplos de Componentes React para Google OAuth2
 * 
 * Estes arquivos são exemplos de como integrar a autenticação Google
 * no seu frontend React do projeto Kairo.
 * 
 * Copie e adapte conforme necessário para seu projeto.
 */

// ============================================
// 1. Componente GoogleLoginButton.jsx
// ============================================
import React from 'react';
import { FaGoogle } from 'react-icons/fa';

export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    // Redirecionar para rota de autenticação
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      className="google-login-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold'
      }}
    >
      <FaGoogle size={20} />
      Login com Google
    </button>
  );
}

// ============================================
// 2. Hook useGoogleAuth.js
// ============================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useGoogleAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar se voltou do callback com token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Salvar token no localStorage
      localStorage.setItem('authToken', token);
      
      // Limpar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Buscar dados do usuário
      fetchUserData(token);
    } else {
      // Verificar se já tem token
      const existingToken = localStorage.getItem('authToken');
      if (existingToken) {
        fetchUserData(existingToken);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      // Decodificar JWT para obter dados do usuário
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao processar token:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Extrair ID do usuário do token
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Fazer logout no backend
      await fetch('http://localhost:3000/auth/google/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_usuario: payload.id_usuario })
      });

      // Limpar localStorage
      localStorage.removeItem('authToken');
      setUser(null);
      
      // Redirecionar para login
      navigate('/login');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      setError(err.message);
    }
  };

  return { user, loading, error, logout };
}

// ============================================
// 3. Componente LoginPage.jsx
// ============================================
export function LoginPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1>Kairo - Sistema de Agendamentos</h1>
        <p>Faça login para continuar</p>
        
        <GoogleLoginButton />
        
        <p style={{ marginTop: '20px', color: '#666' }}>
          Ou faça login com email e senha (em desenvolvimento)
        </p>
      </div>
    </div>
  );
}

// ============================================
// 4. Componente UserProfile.jsx
// ============================================
export function UserProfile({ user, onLogout }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px'
    }}>
      <div>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          {user?.nome || 'Usuário'}
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
          {user?.email}
        </p>
      </div>
      
      <button 
        onClick={onLogout}
        style={{
          padding: '8px 16px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginLeft: 'auto'
        }}
      >
        Logout
      </button>
    </div>
  );
}

// ============================================
// 5. Exemplo de uso em App.jsx
// ============================================
/*
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';

function App() {
  const { user, loading, error, logout } = useGoogleAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Dashboard user={user} onLogout={logout} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
*/

// ============================================
// 6. Serviço para chamar API
// ============================================
export class GoogleCalendarService {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async createEvent(userId, eventData) {
    try {
      const response = await fetch(`${this.baseURL}/calendario/evento`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({
          id_usuario: userId,
          ...eventData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async listEvents(userId, options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.timeMin) params.append('timeMin', options.timeMin);
      if (options.timeMax) params.append('timeMax', options.timeMax);
      if (options.maxResults) params.append('maxResults', options.maxResults);

      const response = await fetch(
        `${this.baseURL}/calendario/eventos/${userId}?${params.toString()}`,
        {
          headers: this.getAuthHeader()
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      throw error;
    }
  }

  async updateEvent(userId, eventId, eventData) {
    try {
      const response = await fetch(
        `${this.baseURL}/calendario/evento/${eventId}`,
        {
          method: 'PUT',
          headers: this.getAuthHeader(),
          body: JSON.stringify({
            id_usuario: userId,
            ...eventData
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  }

  async deleteEvent(userId, eventId) {
    try {
      const response = await fetch(
        `${this.baseURL}/calendario/evento/${eventId}?id_usuario=${userId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeader()
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  }
}

// ============================================
// 7. Exemplo de uso do serviço
// ============================================
/*
import { useEffect, useState } from 'react';
import { GoogleCalendarService } from './services/GoogleCalendarService';
import { useGoogleAuth } from './hooks/useGoogleAuth';

function CalendarComponent() {
  const { user } = useGoogleAuth();
  const [events, setEvents] = useState([]);
  const calendarService = new GoogleCalendarService();

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const result = await calendarService.listEvents(user.id_usuario);
      setEvents(result.events);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const newEvent = {
        summary: 'Nova Consulta',
        description: 'Consulta com Dr. Silva',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
      };

      const result = await calendarService.createEvent(user.id_usuario, newEvent);
      alert('Evento criado com sucesso!');
      loadEvents(); // Recarregar lista
    } catch (error) {
      alert('Erro ao criar evento: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Meus Eventos</h2>
      <button onClick={handleCreateEvent}>+ Novo Evento</button>
      
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.summary} - {event.start.dateTime}
          </li>
        ))}
      </ul>
    </div>
  );
}
*/
