import { ApiKeyRecord } from '../types';

export interface RegisterInput {
  institute: string;
  email: string;
  password: string;
}

export const validateRegister = (body: unknown): RegisterInput => {
  const value = body as Partial<RegisterInput>;
  if (!value || !value.institute || !value.email || !value.password) {
    throw new Error('institute, email, and password are required');
  }
  if (!value.email.includes('@')) {
    throw new Error('email must be valid');
  }
  return {
    institute: value.institute.trim(),
    email: value.email.trim().toLowerCase(),
    password: value.password,
  };
};

export interface RegisterResponseDTO {
  apiKey: string;
  institute: string;
}

export const toRegisterResponse = (record: ApiKeyRecord): RegisterResponseDTO => ({
  apiKey: record.apiKey,
  institute: record.institute,
});
