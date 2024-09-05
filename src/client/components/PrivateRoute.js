import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const PrivateRoute = ({ adminOnly = false }) => {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Loader2 className="animate-spin" size={24} />
        </div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/unauthorized" />;
    }

    return <Outlet />;
};