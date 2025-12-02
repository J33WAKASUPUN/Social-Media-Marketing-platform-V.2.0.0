console.log('Testing module imports...\n');

try {
  console.log('1. Loading workers.js...');
  require('./src/workers');
  console.log('   ✅ Success\n');
} catch (error) {
  console.error('   ❌ Failed:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}

console.log('All imports successful!');