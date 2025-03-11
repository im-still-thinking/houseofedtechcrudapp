import NextAuth from 'next-auth';
import { authOptions } from './options';

// Create the handler using the authOptions
const handler = NextAuth(authOptions);

// Export the handler as GET and POST
export { handler as GET, handler as POST };
