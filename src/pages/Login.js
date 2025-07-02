import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import loginVisual from '../assets/Login-pana.png';

const Login = () => {
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Determine if input is an email or mobile number
      const isEmail = /\S+@\S+\.\S+/.test(loginValue);
      const payload = isEmail
        ? { email: loginValue, password }
        : { mobile: loginValue, password };

      const res = await axios.post('http://localhost:3000/auth/login', payload);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email/mobile or password');
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
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
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