import 'dotenv/config';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase env variables.');
  process.exit(1);
}

async function createTestUser() {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Password123!',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Error creating user:', data);
    process.exit(1);
  }
  console.log('User created:', data);
  process.exit(0);
}

createTestUser();
