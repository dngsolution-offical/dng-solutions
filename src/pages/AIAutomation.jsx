import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AIAutomation() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/agents', { replace: true });
  }, [navigate]);
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
      Redirecting to AI Agents...
    </div>
  );
}
