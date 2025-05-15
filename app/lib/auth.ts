
// List of admin email addresses
const ADMIN_EMAILS = [
  'mujtabachandio384@gmail.com', // Add your admin email here
];

export const isAdmin = (email: string | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}; 