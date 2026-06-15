/**
 * Shared test helpers — token generation + request utilities
 */
import * as jwt from 'jsonwebtoken';

const SECRET = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

/** Mint a fake JWT that will pass JWT verification but will likely fail Supabase user lookup. */
export function makeFakeToken(payload: { sub: string; role: string } = { sub: 'fake-user-id', role: 'consumer' }) {
  return jwt.sign({ ...payload, type: 'access' }, SECRET, { expiresIn: '1h', algorithm: 'HS256' });
}

export const BASE = '/api/v1';

/** Minimal valid product payload for create tests */
export const sampleProduct = {
  name: 'Test Tomato',
  price: 50,
  unit: 'kg',
  category: 'Vegetables',
  stock_quantity: 100,
  description: 'Fresh tomatoes',
  is_available: true,
};

/** Minimal valid registration body */
export function randomEmail() {
  return `test_${Date.now()}@example.com`;
}

export const sampleRegisterBody = () => ({
  email: randomEmail(),
  password: 'TestPass123!',
  full_name: 'Test User',
  role: 'consumer',
});

export const sampleFarmerBody = () => ({
  email: randomEmail(),
  password: 'TestPass123!',
  full_name: 'Test Farmer',
  role: 'farmer',
  farm_name: 'Green Fields',
  farm_location: 'Tamil Nadu',
});
