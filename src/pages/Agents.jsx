// src/pages/Agents.jsx — Full screen AI page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AgentChat from '../components/agents/AgentChat';

export default function Agents() {
  const navigate = useNavigate();

  const defaultAgent = {
    id: 'dng-ai',
    name: 'DNG AI',
    nameKa: 'DNG AI',
    description: 'ქართული ბიზნეს AI ასისტენტი',
  };

  return (
    <AgentChat
      agent={defaultAgent}
      onClose={() => navigate('/')}
      onHome={() => navigate('/')}
    />
  );
}