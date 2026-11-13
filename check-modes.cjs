const PACKAGE_LEVELS = { Free: 0, Basic: 1, Gold: 2, Diamond: 3, Infinity: 4 };

const MODES = [
  { id: 'text',       min: 'Free',    name: 'Text' },
  { id: 'email',      min: 'Free',    name: 'Email' },
  { id: 'vision',     min: 'Basic',   name: 'Vision (Photo)' },
  { id: 'file',       min: 'Basic',   name: 'File (PDF/DOCX)' },
  { id: 'batch',      min: 'Gold',    name: 'Batch (Multiple)' },
  { id: 'thinking',   min: 'Diamond', name: 'Thinking (Deep)' },
  { id: 'scheduler',  min: 'Gold',    name: 'Scheduler' },
  { id: 'automation', min: 'Diamond', name: 'Automation (24/7)' },
];

const PACKAGES = ['Free', 'Basic', 'Gold', 'Diamond', 'Infinity'];

console.log('');
console.log('=========================================================');
console.log('  AVAILABLE MODES PER PACKAGE');
console.log('=========================================================');

for (const pkg of PACKAGES) {
  console.log('');
  console.log(`[${pkg}]`);
  const allowed = MODES.filter(m => PACKAGE_LEVELS[pkg] >= PACKAGE_LEVELS[m.min]);
  const locked = MODES.filter(m => PACKAGE_LEVELS[pkg] < PACKAGE_LEVELS[m.min]);
  
  console.log(`  ALLOWED (${allowed.length}/${MODES.length}):`);
  allowed.forEach(m => console.log(`    ✅ ${m.name}`));
  
  if (locked.length > 0) {
    console.log(`  LOCKED (${locked.length}):`);
    locked.forEach(m => console.log(`    🔒 ${m.name} (needs ${m.min}+)`));
  }
}
console.log('');
console.log('=========================================================');