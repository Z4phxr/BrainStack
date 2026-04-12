import { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      isPro: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
    /** Present for credential sign-in; omit for other providers. */
    isPro?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    /** Refreshed with `role` from DB; may be absent on legacy tokens until refresh. */
    isPro?: boolean;
  }
}
