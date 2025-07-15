import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuth } from '../features/auth/authSlice';
import './Login.css';
import loginVisual from '../assets/Login-pana.png';

const Login = () => {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(selectAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      const result = await dispatch(loginUser({ loginValue, password }));
      if (loginUser.fulfilled.match(result)) {
        navigate('/dashboard');
      } else {
        setLocalError('Invalid email/mobile or password');
      }
    } catch (err) {
      setLocalError('Something went wrong');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-image">
          <img src={loginVisual} alt="Login Illustration" />
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>
          <p className="login-subtext">Please enter your email or mobile number and password</p>
          {localError && <div style={{ color: 'red', marginBottom: 10 }}>{localError}</div>}
          <input
            type="text"
            placeholder="Email or Mobile number"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="login-options">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Logging in...' : 'Login'}
          </button>
          <div className="login-footer">
            Don’t have an account? <Link to="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
