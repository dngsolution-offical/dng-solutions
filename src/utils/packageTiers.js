// src/utils/packageTiers.js
// 🎯 პაკეტების ცენტრალური კონფიგურაცია

export const PACKAGE_TIERS = {
  // ⚠️ Free — სატესტო პაკეტი (არ იყიდება, ავტომატურად ენიჭება ახალ მომხმარებელს)
  Free: {
    level: 0,
    name: 'უფასო',
    maxOrders: 10,
    validityDays: 7,
    model: 'claude-haiku-5-5',
    maxTokens: 512,
    priority: 'low',
    rateLimitPerMin: 3,
    features: ['text_analysis', 'csv_export'],
    color: 'text-gray-400',
    badge: 'Free',
  },
  Basic: {
    level: 1,
    name: 'ბაზისური',
    maxOrders: 100,
    validityDays: 30,
    model: 'claude-haiku-5-5',
    maxTokens: 1024,
    priority: 'standard',
    rateLimitPerMin: 10,
    features: ['text_analysis', 'csv_export', 'file_upload'],
    color: 'text-blue-400',
    badge: 'Basic',
  },
  Gold: {
    level: 2,
    name: 'ოქრო',
    maxOrders: 1000,
    validityDays: 30,
    model: 'claude-haiku-5-5',
    maxTokens: 2048,
    priority: 'high',
    rateLimitPerMin: 20,
    features: ['text_analysis', 'csv_export', 'file_upload', 'excel_reports', 'crm_integration', 'prompt_caching'],
    color: 'text-yellow-400',
    badge: 'Gold',
  },
  Diamond: {
    level: 3,
    name: 'ალმასი',
    maxOrders: 5000,
    validityDays: 30,
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    priority: 'highest',
    rateLimitPerMin: 50,
    features: ['text_analysis', 'csv_export', 'file_upload', 'excel_reports', 'crm_integration', 'prompt_caching', 'vision', 'api_access'],
    color: 'text-purple-400',
    badge: 'Diamond',
  },
  Infinity: {
    level: 4,
    name: 'უსასრულო',
    maxOrders: Infinity,
    validityDays: 365,
    model: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
    priority: 'ultimate',
    rateLimitPerMin: 100,
    features: ['text_analysis', 'csv_export', 'file_upload', 'excel_reports', 'crm_integration', 'prompt_caching', 'vision', 'api_access', 'priority_queue', 'batch_processing'],
    color: 'text-dng-cyan',
    badge: 'Infinity',
  },
};

// დამხმარე ფუნქციები
export const getTier = (packageName) => {
  return PACKAGE_TIERS[packageName] || PACKAGE_TIERS.Free;
};

export const hasFeature = (packageName, feature) => {
  const tier = getTier(packageName);
  return tier.features.includes(feature);
};

export const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Low',
    standard: 'Standard',
    high: 'High',
    highest: 'Highest',
    ultimate: 'Ultimate',
  };
  return labels[priority] || priority;
};