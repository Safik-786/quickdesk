import { LegacyRole } from '@prisma/client';

export interface JwtUser {
  id: string;
  email: string;
  name: string;
  role: LegacyRole;
  legacyRole: LegacyRole;
}

export interface RequestWithUser {
  user?: JwtUser;
}
