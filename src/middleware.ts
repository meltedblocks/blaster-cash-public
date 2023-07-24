export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/((?!api|pay/|order|login|hello).*)'],
};
