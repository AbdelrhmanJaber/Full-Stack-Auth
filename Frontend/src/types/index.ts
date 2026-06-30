export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

/** The backend wraps all responses in a `data` envelope. */
export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface FieldError {
  field: string;
  message: string;
}
