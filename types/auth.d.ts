// src/types/auth.d.ts

export interface User {
    id: string;
    userName: string;
    email: string;
    password: string;
}

export interface JwtPayload {
    userId: string;
}
