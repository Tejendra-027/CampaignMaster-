import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Select from 'react-select';
import Swal from 'sweetalert2';
import './Register.css';
import loginVisual from '../assets/Login-pana.png';

const roleOptions = [
  { value: 2, label: 'User (default)' },
  { value: 1, label: 'Admin (manage users)' }
];

const countryCodeOptions = [
  { value: '+91', label: '+91 (India)' },
  { value: '+1', label: '+1 (USA)' },
  { value: '+44', label: '+44 (UK)' }
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileCountryCode: countryCodeOptions[0],
    mobile: '',
    password: '',
    roleId: 2
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Optional reset on mount
    setFormData({
      name: '',
      email: '',
      mobileCountryCode: countryCodeOptions[0],
      mobile: '',
      password: '',
      roleId: 2
    });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCountryCodeChange = (selected) => {
    setFormData(prev => ({
      ...prev,
      mobileCountryCode: selected
    }));
  };

  const handleRoleChange = (selected) => {
    setFormData(prev => ({
      ...prev,
      roleId: selected.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const combinedMobile = `${formData.mobileCountryCode.value}${formData.mobile}`;

    if (!/^\+\d{10,15}$/.test(combinedMobile)) {
      return Swal.fire({
        icon: 'warning',
        title: 'Invalid Mobile Format',
        text: 'Enter a valid mobile number (e.g. +91XXXXXXXXXX)',
        confirmButtonColor: '#3085d6'
      });
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobileCountryCode: formData.mobileCountryCode.value,
        mobile: formData.mobile,
        password: formData.password,
        roleId: formData.roleId
      };

      await axios.post('http://localhost:3000/auth/register', payload);

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'Your account has been created!',
        confirmButtonText: 'Login Now',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        navigate('/login');
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.message || 'Please try again later.',
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-image">
          <img src={loginVisual} alt="Register Visual" />
        </div>
        <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
          <h2>Create Account</h2>
          <p className="form-subtext">Please fill in the details to register</p>

          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="off"
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="off"
          />

          <div className="mobile-group">
            <Select
              options={countryCodeOptions}
              value={formData.mobileCountryCode}
              onChange={handleCountryCodeChange}
              classNamePrefix="react-select"
              className="mobile-code-select"
              isSearchable={false}
            />
            <input
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          <input
            name="password"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <button type="submit">Register</button>

          <p className="form-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
