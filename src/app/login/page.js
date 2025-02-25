// src/app/login/page.js

"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";  // Use the next/navigation module
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FaSignInAlt } from 'react-icons/fa';
import { loginUser } from '../api/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await loginUser({ email, password });
      router.push('/home'); // Redirect to the home page after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <Button type="submit" className="w-full flex items-center justify-center">
          <FaSignInAlt className="mr-2" /> Login
        </Button>
      </form>
      <p className="mt-4">
        Don't have an account? <a href="/register" className="text-blue-500">Register</a>
      </p>
    </div>
  );
}
