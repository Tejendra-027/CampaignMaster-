// src/pages/Login.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import loginVisual from '../assets/Login-pana.png';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mobile && password) {
      dispatch(login({ mobile }));
      navigate('/dashboard');
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
          <p className="login-subtext">Please enter your mobile number and password</p>

          <input
            type="tel"
            placeholder="Mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            pattern="[0-9]{10}"
            maxLength={10}
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
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit">Login</button>

          <div className="login-footer">
            Don’t have an account? <a href="#">Register</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
