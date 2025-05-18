import React, { useState } from 'react';
import { signUp, signIn, confirmSignUp, SignUpInput, ConfirmSignUpInput } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

interface User {
  username: string;
  userId: string;
}

interface AuthProps {
  setUser: (user: User | null) => void;
}

enum AuthState {
  SIGN_IN,
  SIGN_UP,
  CONFIRM_SIGN_UP
}

const Auth: React.FC<AuthProps> = ({ setUser }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [authState, setAuthState] = useState<AuthState>(AuthState.SIGN_IN);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const signUpInput: SignUpInput = {
        username: email,
        password,
        options: {
          userAttributes: { email },
        },
      };
      await signUp(signUpInput);
      setAuthState(AuthState.CONFIRM_SIGN_UP);
      toast.success('Please check your email for confirmation code');
    } catch (err: any) {
      toast.error(err.message || 'Sign-up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn({ username: email, password });
      const user = { username: email, userId: email };
      setUser(user);
      toast.success('Sign-in successful!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const confirmSignUpInput: ConfirmSignUpInput = {
        username: email,
        confirmationCode
      };
      await confirmSignUp(confirmSignUpInput);
      toast.success('Email confirmed! You can now sign in.');
      setAuthState(AuthState.SIGN_IN);
    } catch (err: any) {
      toast.error(err.message || 'Confirmation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    switch (authState) {
      case AuthState.SIGN_IN:
        return (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-700 transition font-semibold disabled:bg-blue-300"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setAuthState(AuthState.SIGN_UP)}
              className="w-full text-blue-500 hover:underline text-sm font-medium mt-2"
            >
              Need an account? Sign Up
            </button>
            <button
              type="button"
              onClick={() => setAuthState(AuthState.CONFIRM_SIGN_UP)}
              className="w-full text-blue-500 hover:underline text-sm font-medium"
            >
              Already signed up? Confirm your account
            </button>
          </form>
        );
      case AuthState.SIGN_UP:
        return (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-700 transition font-semibold disabled:bg-blue-300"
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => setAuthState(AuthState.SIGN_IN)}
              className="w-full text-blue-500 hover:underline text-sm font-medium mt-2"
            >
              Already have an account? Sign In
            </button>
          </form>
        );
      case AuthState.CONFIRM_SIGN_UP:
        return (
          <form onSubmit={handleConfirmSignUp} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Confirmation Code</label>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-700 transition font-semibold disabled:bg-blue-300"
            >
              {isLoading ? 'Confirming...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => setAuthState(AuthState.SIGN_IN)}
              className="w-full text-blue-500 hover:underline text-sm font-medium mt-2"
            >
              Back to Sign In
            </button>
          </form>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {authState === AuthState.SIGN_IN ? 'Sign In' : 
         authState === AuthState.SIGN_UP ? 'Create Account' : 'Confirm Account'}
      </h2>
      {renderForm()}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Auth;
