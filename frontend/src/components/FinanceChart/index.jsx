import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Title } from '../Title';

const data = [
  { name: '3/2025', receita: 0, despesa: 0 },
  { name: '10/2025', receita: 0, despesa: 0 },
  { name: '1/2026', receita: 0, despesa: 11 },
  { name: '2/2026', receita: 0, despesa: 6 },
  { name: '3/2026', receita: 0, despesa: 6 },
  { name: '4/2026', receita: 22, despesa: 0 },
];

export default function FinanceChart() {
  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #f0f0f0', height: '400px', boxShadow: '10px 10px 20px 0px rgba(0, 0, 0, 0.75)' }}>
      <Title style={{ textAlign: 'center', marginBottom: '20px' }}>Receitas x Despesas por Mês</Title>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value}`} />
          <Tooltip />
          <Legend iconType="circle" />
          <Line type="monotone" dataKey="receita" stroke="#52c41a" strokeWidth={3} dot={{ r: 6 }} name="Receita" />
          <Line type="monotone" dataKey="despesa" stroke="#f5222d" strokeWidth={3} dot={{ r: 6 }} name="Despesa" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}