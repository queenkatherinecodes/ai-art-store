import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';
import { CircularProgress } from '@mui/material';

const CustomCheckbox = ({ checked, onChange, label }) => {
    return (
        <label className="custom-checkbox">
            <span className="checkbox-label">{label}</span>
            <div className="checkbox-container">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                />
                <span className="checkmark">
                    {checked && <Check size={16} />}
                </span>
            </div>
        </label>
    );
};

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/products');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setIsLoading(true);

        if (!username || !password) {
            setErrors({ general: 'Username and password are required' });
            setIsLoading(false);
            return;
        }

        try {
            const success = await login(username, password, rememberMe);
            if (success) {
                console.log('Login successful, redirecting to products page');
                window.location.reload();
                navigate('/products');
            } else {
                setErrors({ general: 'Invalid username or password' });
            }
        } catch (err) {
            console.error('Login error:', err);
            setErrors({ general: 'Login failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="loading-container">
                <CircularProgress />
                <p>Checking authentication status...</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="loading-container">
                <CircularProgress />
                <p>Logging in...</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="credentials-page">
                <h1>Login</h1>
                {location.state?.message && (
                    <p className="success-message">{location.state.message}</p>
                )}
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
                    </div>
                    <div className="form-group">
                        <CustomCheckbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            label="Remember me?"
                        />
                    </div>
                    {errors.general && <p className="error-message">{errors.general}</p>}
                    <button type="submit" className="button" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="text-center mt-2">
                    Don't have an account? <a href="/register" className="login-link">Register here</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;