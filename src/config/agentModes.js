// src/config/agentModes.js
export const AGENT_MODES = [
  {
    id: 'standard',
    icon: 'Zap',
    labelKey: 'agentChat.modes.standard',
    labelFallback: 'Standard',
    descKey: 'agentChat.modes.standardDesc',
    descFallback: 'სწრაფი, პირდაპირი პასუხები',
    requiredPackage: 'Free',
  },
  {
    id: 'concise',
    icon: 'Minimize',
    labelKey: 'agentChat.modes.concise',
    labelFallback: 'Concise',
    descKey: 'agentChat.modes.conciseDesc',
    descFallback: 'მოკლე, კონკრეტული პასუხები',
    requiredPackage: 'Basic',
  },
  {
    id: 'thinking',
    icon: 'Brain',
    labelKey: 'agentChat.modes.thinking',
    labelFallback: 'Thinking',
    descKey: 'agentChat.modes.thinkingDesc',
    descFallback: 'აჩვენე მსჯელობის ნაბიჯები',
    requiredPackage: 'Gold',
  },
  {
    id: 'extended',
    icon: 'Sparkles',
    labelKey: 'agentChat.modes.extended',
    labelFallback: 'Extended Thinking',
    descKey: 'agentChat.modes.extendedDesc',
    descFallback: 'ღრმა ანალიზი ხანგრძლივი მსჯელობით',
    requiredPackage: 'Diamond',
  },
  {
    id: 'creative',
    icon: 'Palette',
    labelKey: 'agentChat.modes.creative',
    labelFallback: 'Creative',
    descKey: 'agentChat.modes.creativeDesc',
    descFallback: 'კრეატიული, მრავალფეროვანი პასუხები',
    requiredPackage: 'Diamond',
  },
  {
    id: 'autonomous',
    icon: 'Cpu',
    labelKey: 'agentChat.modes.autonomous',
    labelFallback: 'Autonomous',
    descKey: 'agentChat.modes.autonomousDesc',
    descFallback: 'აგენტი დამოუკიდებლად ასრულებს დავალებას',
    requiredPackage: 'Infinity',
  },
];

export const getModeById = (id) => AGENT_MODES.find((m) => m.id === id);