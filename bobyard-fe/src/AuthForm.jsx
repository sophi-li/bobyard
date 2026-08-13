import React, { useState } from 'react';

export function AuthForm({ onLogin, onSignup, authError, setAuthError }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await onLogin({ username, password });
      } else {
        await onSignup({ username, password });
      }
    } catch (e) {
      // Failure is already surfaced via authError.
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setAuthError(null);
  };

  return (
    <form className="form authForm" onSubmit={handleSubmit}>
      <label htmlFor="username">Username:</label>
      <input
        className="textInput"
        id="username"
        type="text"
        value={username}
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <label htmlFor="password">Password:</label>
      <input
        className="textInput"
        id="password"
        type="password"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      {authError && <p className="authError">{authError}</p>}
      <button type="submit" className="submitBtn" disabled={isSubmitting}>
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </button>
      <button type="button" className="authToggleBtn" onClick={toggleMode}>
        {mode === 'login'
          ? 'Need an account? Sign up'
          : 'Have an account? Log in'}
      </button>
    </form>
  );
}
