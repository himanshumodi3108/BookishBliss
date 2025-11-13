import React, { useContext, useState } from 'react'
import { AuthContext } from '../contexts/AuthProvider'
import { useLocation, useNavigate } from 'react-router-dom';
import showToast from '../utils/toast';
import { Spinner } from 'flowbite-react';

const Logout = () => {
    const {logOut} = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || "/";

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logOut();
            showToast.success("Sign-out successful!");
            navigate(from, {replace: true});
        } catch (error) {
            showToast.error("Failed to sign out. Please try again.");
        } finally {
            setLoading(false);
        }
    }
  return (
    <div className='h-screen bg-teal-100 flex items-center justify-center'>
        <button 
            className='bg-red-700 px-8 py-2 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2' 
            onClick={handleLogout}
            disabled={loading}
        >
            {loading && <Spinner size="sm" />}
            Logout
        </button>
    </div>
  )
}

export default Logout