import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Title } from '../Title';

export default function FinanceChart({ chartData = [] }) {
  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #f0f0f0', height: '400px', boxShadow: '10px 10px 20px 0px rgba(0, 0, 0, 0.75)' }}>
      <Title style={{ textAlign: 'center', marginBottom: '20px' }}>Receitas x Despesas por Mês</Title>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value}`} />
          <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
          <Legend iconType="circle" />
          <Line type="monotone" dataKey="receitas" stroke="#52c41a" strokeWidth={3} dot={{ r: 6 }} name="Receita" />
          <Line type="monotone" dataKey="despesas" stroke="#f5222d" strokeWidth={3} dot={{ r: 6 }} name="Despesa" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}