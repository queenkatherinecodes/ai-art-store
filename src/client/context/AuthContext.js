import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: true,
        user: null
    });

    const checkAuthStatus = useCallback(async () => {
        console.log('Checking auth status...');
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
            const authData = await authService.authenticate();
            console.log('Auth check complete. Auth data:', authData);
            if (authData.authenticated) {
                const isAdmin = authData.user.username === 'admin';
                setAuthState({
                    isAuthenticated: true,
                    isAdmin,
                    isLoading: false,
                    user: authData.user
                });
            } else {
                throw new Error('Not authenticated');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                user: null
            });
        }
    }, []);

    const login = useCallback(async (username, password, rememberMe) => {
        console.log('Attempting login...');
        try {
            const userData = await authService.login(username, password, rememberMe);
            console.log('Login successful. User data:', userData);
            const isAdmin = username === 'admin';
            setAuthState({
                isAuthenticated: true,
                isAdmin,
                isLoading: false,
                user: { id: userData.id, username }
            });
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                user: null
            });
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        console.log('Attempting logout...');
        try {
            await authService.logout();
            console.log('Logout successful');
            setAuthState({
                isAuthenticated: false,
                isAdmin: false,
                isLoading: false,
                user: null
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    useEffect(() => {
        console.log('Auth state updated:', authState);
    }, [authState]);

    const value = {
        ...authState,
        login,
        logout,
        checkAuthStatus
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};