'use client';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('AuthForm: User already authenticated, redirecting to dashboard');
        router.push('/dashboard');
      }
      setIsAuthInitialized(true);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('AuthForm: Starting authentication process', { isSignIn, email });
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Please fill in all required fields');
      }

      if (!isSignIn && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (isSignIn) {
        console.log('AuthForm: Attempting sign in');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('AuthForm: Sign in successful', { 
          user: userCredential.user.email,
          uid: userCredential.user.uid
        });
      } else {
        console.log('AuthForm: Attempting sign up');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('AuthForm: Sign up successful', { 
          user: userCredential.user.email,
          uid: userCredential.user.uid
        });
      }

      // Wait a moment to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('AuthForm: Redirecting to dashboard');
      router.push('/dashboard');
    } catch (error) {
      console.error('AuthForm: Authentication error', error);
      // Handle specific error cases
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking initial auth
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {isSignIn ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>

        {/* Toggle Buttons */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setIsSignIn(true)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              isSignIn
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignIn(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              !isSignIn
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {!isSignIn && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignIn ? 'Signing in...' : 'Signing up...'}
                </div>
              ) : (
                isSignIn ? 'Sign in' : 'Sign up'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 