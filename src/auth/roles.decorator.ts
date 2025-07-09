// src/auth/roles.decorator.ts
// FAYL: src/auth/roles.decorator.ts (SİZİN PROYEKTİNİZƏ UYĞUN VERSİYA)

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Biz string[] istifadə edirik, çünki schemada rol sahəsi String tipindədir.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
