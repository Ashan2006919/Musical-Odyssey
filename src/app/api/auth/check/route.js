// src/app/api/auth/check/route.js

import jwt from 'jsonwebtoken';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ message: 'No token provided' }), { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return new Response(JSON.stringify({ message: 'Authenticated', user: decoded }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
  }
}
