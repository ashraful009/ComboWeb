import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run admin:hash -- <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nGenerated Hash:');
console.log(hash);
console.log('\nAdd this to your .env file as ADMIN_PASSWORD_HASH');
