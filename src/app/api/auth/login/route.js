// src/app/api/auth/login/route.js

import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  const { email, password } = await req.json();  // Access request body
  const { db } = await connectToDatabase();
  const user = await db.collection('users').findOne({ email });

  if (!user) {
    return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return new Response(JSON.stringify({ token }), { status: 200 });
}
