import { redirect } from 'next/navigation';

export default async function Home() {
  // Redirect to login - auth is handled by JWT in request headers/cookies
  redirect('/login');
}
