// src/config/packageFeatures.js
// Package → features matrix (controls server-side logic)

export const PACKAGE_ORDER = ['Free', 'Basic', 'Gold', 'Diamond', 'Infinity'];

export const PACKAGE_FEATURES = {
  Free: {
    level: 0,
    dailyMessages: 10,
    maxTokens: 1024,
    ratePerMin: 5,
    maxIterations: 1,

    // Tools
    allowFiles: false,
    allowExcel: false,
    allowVision: false,
    allowCode: false,
    allowThinking: false,
    allowResearch: false,

    // Excel limits
    excelMaxRows: 0,
    excelMaxSheets: 0,

    // File limits
    fileMaxSizeKB: 0,
    fileMaxTypes: [],

    // Agent access (IDs)
    allowedAgents: ['standard', 'support'],
  },
  Basic: {
    level: 1,
    dailyMessages: 100,
    maxTokens: 2048,
    ratePerMin: 20,
    maxIterations: 2,

    allowFiles: true,
    allowExcel: false,
    allowVision: false,
    allowCode: false,
    allowThinking: false,
    allowResearch: false,

    excelMaxRows: 0,
    excelMaxSheets: 0,

    fileMaxSizeKB: 5,
    fileMaxTypes: ['csv', 'json', 'txt', 'md'],

    allowedAgents: ['standard', 'support', 'business', 'file'],
  },
  Gold: {
    level: 2,
    dailyMessages: 500,
    maxTokens: 4096,
    ratePerMin: 50,
    maxIterations: 3,

    allowFiles: true,
    allowExcel: true,
    allowVision: true,
    allowCode: false,
    allowThinking: true,
    allowResearch: false,

    excelMaxRows: 100,
    excelMaxSheets: 3,

    fileMaxSizeKB: 50,
    fileMaxTypes: ['csv', 'json', 'txt', 'md', 'html', 'xml', 'yaml'],

    allowedAgents: [
      'standard', 'support', 'business', 'file', 'excel',
      'finance', 'crypto', 'marketing', 'sales', 'legal',
      'investing', 'product', 'startup', 'vision', 'thinking',
      'businessplan', 'pitchdeck', 'contract', 'meeting', 'calculator',
    ],
  },
  Diamond: {
    level: 3,
    dailyMessages: 2000,
    maxTokens: 6144,
    ratePerMin: 100,
    maxIterations: 4,

    allowFiles: true,
    allowExcel: true,
    allowVision: true,
    allowCode: true,
    allowThinking: true,
    allowResearch: true,

    excelMaxRows: 500,
    excelMaxSheets: 10,

    fileMaxSizeKB: 200,
    fileMaxTypes: ['csv', 'json', 'txt', 'md', 'html', 'xml', 'yaml', 'sql', 'js', 'jsx', 'py', 'css'],

    allowedAgents: [
      'standard', 'support', 'business', 'file', 'excel', 'code',
      'finance', 'crypto', 'marketing', 'sales', 'legal',
      'investing', 'product', 'startup', 'vision', 'thinking',
      'businessplan', 'pitchdeck', 'contract', 'meeting', 'calculator',
      'research', 'competitor',
    ],
  },
  Infinity: {
    level: 4,
    dailyMessages: -1,
    maxTokens: 8192,
    ratePerMin: 300,
    maxIterations: 5,

    allowFiles: true,
    allowExcel: true,
    allowVision: true,
    allowCode: true,
    allowThinking: true,
    allowResearch: true,

    excelMaxRows: 2000,
    excelMaxSheets: 999,

    fileMaxSizeKB: 500,
    fileMaxTypes: ['*'],

    allowedAgents: [
      'standard', 'support', 'business', 'file', 'excel', 'code',
      'finance', 'crypto', 'marketing', 'sales', 'legal',
      'investing', 'product', 'startup', 'vision', 'thinking',
      'businessplan', 'pitchdeck', 'contract', 'meeting', 'calculator',
      'research', 'competitor',
    ],
  },
};

// ─── Helper functions ───

export const getFeatures = (pkg) => PACKAGE_FEATURES[pkg] || PACKAGE_FEATURES.Free;

export const canUseMode = (pkg, mode) => {
  const features = getFeatures(pkg);
  return features.allowedAgents.includes(mode);
};

export const getDailyLimit = (pkg) => {
  return getFeatures(pkg).dailyMessages;
};

export const getExcelLimits = (pkg) => {
  const features = getFeatures(pkg);
  return {
    maxRows: features.excelMaxRows,
    maxSheets: features.excelMaxSheets,
    allowed: features.allowExcel,
  };
};

export const getFileLimits = (pkg) => {
  const features = getFeatures(pkg);
  return {
    maxSizeKB: features.fileMaxSizeKB,
    maxTypes: features.fileMaxTypes,
    allowed: features.allowFiles,
  };
};

export const packageAtLeast = (userPkg, requiredPkg) => {
  const ui = PACKAGE_ORDER.indexOf(userPkg);
  const ri = PACKAGE_ORDER.indexOf(requiredPkg);
  if (ri === -1) return true;
  if (ui === -1) return false;
  return ui >= ri;
};