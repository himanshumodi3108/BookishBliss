import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import googleLogo from "../assets/google-logo.svg";
import showToast from '../utils/toast';
import { Spinner } from 'flowbite-react';

const Signup = () => {
    const {signupJWT, loginWithGoogle, loading} = useContext(AuthContext);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const from = location.state?.from?.pathname || "/";

    const handleSignup = async (event) => {
        event.preventDefault();
        const form = event.target;
        const email = form.email.value.trim();
        const password = form.password.value;
        const name = form.name?.value?.trim() || '';

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            
            // Email/Password signup always uses JWT
            await signupJWT(email, password, name);
            showToast.success("Account created successfully!");
            navigate(from, {replace: true});
        } catch (error) {
            const errorMessage = error.message || "Failed to create account. Please try again.";
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    //Sign up using google account
    const handleGoogleSignup = async () => {
        try {
            setIsSubmitting(true);
            setError("");
            const result = await loginWithGoogle();
            showToast.success("Account created successfully!");
            navigate(from, {replace: true});
        } catch (error) {
            const errorMessage = error.message || "Failed to sign up with Google.";
            setError(errorMessage);
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }



  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div
                className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl">
            </div>
            <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                <div className="max-w-md mx-auto">
                    <div>
                        <h1 className="text-2xl font-semibold">Sign Up Form</h1>
                    </div>
                    <div className="divide-y divide-gray-200">
                        <form onSubmit={handleSignup} className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                            <div className="relative">
                                <input id="name" name="name" type="text" className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600" placeholder="Full Name (optional)" />
                            </div>
                            <div className="relative">
                                <input id="email" name="email" type="text" className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600" placeholder="Email address" />
                            </div>
                            <div className="relative">
                                <input id="password" name="password" type="password" className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:borer-rose-600" placeholder="Password" />
                            </div>
                            {error && <p className='text-red-600 text-base'>{error}</p>}
                            <p>If you have an account, then <Link to="/login" className='text-blue-600 underline'>Login</Link> here</p>
                            <div className="relative">
                                <button 
                                    className="bg-blue-500 text-white rounded-md px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                                    disabled={isSubmitting || loading}
                                >
                                    {(isSubmitting || loading) && <Spinner size="sm" />}
                                    Sign up
                                </button>
                            </div>
                        </form>
                    </div>

                    <hr />
                    <div className='flex w-full items-center flex-col mt-5 gap-3'>
                        <button 
                            onClick={handleGoogleSignup} 
                            className='block disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                            disabled={isSubmitting || loading}
                        >
                            {(isSubmitting || loading) && <Spinner size="sm" />}
                            <img src={googleLogo} alt="" className='w-12 h-12 inline-block' />
                            Sign Up with Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Signup