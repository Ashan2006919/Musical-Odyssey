// src/app/api/auth/index.js

export async function loginUser({ email, password }) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    if (data.message.includes('not verified')) {
      // Redirect to verification page with email as a query parameter
      window.location.href = `/verify?email=${encodeURIComponent(email)}`;
    }
    throw new Error(data.message || 'Login failed');
  }

  // Store the token for later use (e.g., for authenticated requests)
  localStorage.setItem('token', data.token);
  return data;
}

export async function registerUser({ name, email, password, profileImage }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  if (profileImage) {
    formData.append("profileImage", profileImage);
  }

  const response = await fetch("/api/auth/register", {
    method: "POST",
    body: formData, // Send FormData directly
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return await response.json(); // Return the response JSON, including the OTP
}
