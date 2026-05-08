const API = process.env.NEXT_PUBLIC_DJANGO_API || 'http://localhost:8000';

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function register_step1(
  email: string,
  phone: string,
  password: string,
  confirm_password: string,
) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, phone, password, confirm_password }),
  });
  return res.json();
}

export async function register_step2(account_type: string, accessToken: string) {
  const res = await fetch(`${API}/api/auth/register/step2/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ account_type }),
  });
  return res.json();
}

export async function register_step3(formData: FormData, accessToken: string) {
  const res = await fetch('/api/auth/kyc', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  return res.json();
}

export async function refreshToken(refresh: string) {
  const res = await fetch(`${API}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  return res.json();
}

export async function getMe(accessToken: string) {
  const res = await fetch(`${API}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export async function logout(accessToken: string, refresh: string) {
  await fetch(`${API}/api/auth/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refresh }),
  });
}

export async function getPortfolio(accessToken: string) {
  const res = await fetch(`${API}/api/auth/portfolio/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}
