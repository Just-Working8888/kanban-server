// src/types/express.d.ts

import { JwtPayload } from './auth';  // Импортируем тип, если он есть в другом файле
import { Request } from 'express';

// Расширяем тип Request, добавляем свойство `user`
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload; // Здесь `user` будет типом JwtPayload (или любым другим, который ты используешь)
        }
    }
}
