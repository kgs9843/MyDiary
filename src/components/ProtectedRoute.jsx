import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';

const ProtectedRoute = ({ child }) => {
    if (!isTokenValid()) {
        return <Navigate to="/" />
    }
    return child;
}

export default ProtectedRoute;