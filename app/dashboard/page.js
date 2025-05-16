'use client';
import { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import ApplicationForm from '../components/ApplicationForm';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard: Setting up auth state listener');
    
    // Ensure auth is initialized
    if (!auth) {
      console.error('Dashboard: Auth not initialized');
      router.push('/signin');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Dashboard: Auth state changed', { 
        user: user ? user.email : 'no user',
        authChecked: true 
      });
      
      if (!user) {
        console.log('Dashboard: No user found, redirecting to signin');
        router.push('/signin');
      } else {
        console.log('Dashboard: User authenticated', { 
          email: user.email,
          uid: user.uid,
          isAnonymous: user.isAnonymous,
          metadata: user.metadata
        });
        setUser(user);
      }
      setAuthChecked(true);
      setLoading(false);
    });

    return () => {
      console.log('Dashboard: Cleaning up auth state listener');
      unsubscribe();
    };
  }, [router]);

  // Show loading state while checking auth
  if (loading || !authChecked) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      </main>
    );
  }

  // If we've checked auth and there's no user, don't render the dashboard
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {user.email}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete your application to become a driving instructor.
          </p>
        </div>
        <ApplicationForm />
      </div>
    </main>
  );
} 