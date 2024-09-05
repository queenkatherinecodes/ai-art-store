import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const errors = {};
        if (password.length < 8) {
            errors.length = 'Password must be at least 8 characters long';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.specialChar = 'Password must include at least one special character';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!username || !password) {
            setErrors({ general: 'Username and password are required' });
            return;
        }

        const passwordErrors = validatePassword(password);
        if (Object.keys(passwordErrors).length > 0) {
            setErrors(passwordErrors);
            return;
        }

        try {
            await authService.register(username, password);
            navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
        } catch (err) {
            setErrors({ general: err.response?.data?.message || 'Registration failed. Please try again.' });
        }
    };

    return (
        <div className="container">
            <div className="credentials-page">
                <h1>Create an Account</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                        {errors.length && <p className="error-message">{errors.length}</p>}
                        {errors.specialChar && <p className="error-message">{errors.specialChar}</p>}
                    </div>
                    {errors.general && <p className="error-message">{errors.general}</p>}
                    <button type="submit" className="button">Register</button>
                </form>
                <p className="text-center mt-2">
                    Already have an account? <a href="/login" className="login-link">Login here</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;