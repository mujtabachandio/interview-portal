import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Interview Portal',
  description: 'A platform for conducting interviews',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen`}>
        <AuthProvider>
          <Sidebar />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
