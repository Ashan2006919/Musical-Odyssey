// src/app/api/auth/index.js

export async function loginUser({ email, password }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
  
    // Store the token for later use (e.g., for authenticated requests)
    localStorage.setItem('token', data.token);
    return data;
  }
  