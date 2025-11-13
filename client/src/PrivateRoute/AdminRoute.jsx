import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthProvider'
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from "flowbite-react";
import apiClient from '../utils/api';
import { checkAdminStatus } from '../utils/checkAdmin';

const AdminRoute = ({children}) => {
    const {user, loading} = useContext(AuthContext);
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSeller, setIsSeller] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);

    useEffect(() => {
        const checkAccessStatus = async () => {
            if (!user) {
                setCheckingAccess(false);
                return;
            }

            try {
                // Check if user is admin using the same logic as checkAdminStatus
                const adminStatus = await checkAdminStatus(user);
                console.log('AdminRoute - Admin status:', adminStatus, 'User:', user.email || user.user?.email);
                
                // Check if user is a seller (has approved seller requests or books)
                let sellerStatus = false;
                try {
                    const sellerStatusResponse = await apiClient.get('/seller/status');
                    sellerStatus = sellerStatusResponse.isSeller || false;
                } catch (error) {
                    // If endpoint fails, assume not a seller
                    sellerStatus = false;
                }

                setIsAdmin(adminStatus);
                setIsSeller(sellerStatus);
            } catch (error) {
                console.error('Error checking access status:', error);
                // On error, don't deny access - let it through and log the error
                // This prevents false negatives from causing redirects
            } finally {
                setCheckingAccess(false);
            }
        };

        // Only check if user is available and not loading
        if (user && !loading) {
            checkAccessStatus();
        } else if (!user && !loading) {
            setCheckingAccess(false);
        }
    }, [user, loading]);

    if(loading || checkingAccess) {
        return (
            <div className='text-center min-h-screen flex items-center justify-center'>
                <Spinner size="xl" />
            </div>
        );
    }

    if(!user) {
        return <Navigate to="/login" state={{from: location}} replace />;
    }

    // Allow access if user is admin OR seller
    if(!isAdmin && !isSeller) {
        return (
            <div className='text-center min-h-screen flex items-center justify-center'>
                <div>
                    <h1 className='text-2xl font-bold text-red-600 mb-4'>Access Denied</h1>
                    <p className='text-gray-600'>You don't have permission to access this page.</p>
                    <Navigate to="/" replace />
                </div>
            </div>
        );
    }

    // Pass access level to children via context or props
    return React.cloneElement(children, { isAdmin, isSeller });
}

export default AdminRoute;
