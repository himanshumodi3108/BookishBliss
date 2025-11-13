import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import App from "../App"; 
import Home from "../home/Home";
import Shop from "../shop/Shop";
import About from "../components/About";
import Blog from "../components/Blog";
import SingleBook from "../shop/SingleBook";
import DashboardLayout from "../dashboard/DashboardLayout";
import Dashboard from "../dashboard/Dashboard";
import UploadBook from "../dashboard/UploadBook";
import ManageBooks from "../dashboard/ManageBooks";
import EditBooks from "../dashboard/EditBooks";
import Signup from "../components/Signup";
import Login from "../components/Login";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import AdminRoute from "../PrivateRoute/AdminRoute";
import Logout from "../components/Logout";
import ErrorBoundary from "../components/ErrorBoundary";
import Cart from "../components/Cart";
import Checkout from "../components/Checkout";
import PaymentSuccess from "../components/PaymentSuccess";
import PaymentFailed from "../components/PaymentFailed";
import UserProfile from "../components/UserProfile";
import Orders from "../components/Orders";
import OrderDetails from "../components/OrderDetails";
import Wishlist from "../components/Wishlist";
import ForgotPassword from "../components/ForgotPassword";
import SellerRequestForm from "../components/SellerRequestForm";
import SellerRequests from "../components/SellerRequests";
import ManageSellerRequests from "../dashboard/ManageSellerRequests";
import SellerDashboard from "../dashboard/SellerDashboard";
import { Button } from "flowbite-react";
import config from '../config/config';
import apiClient from '../utils/api';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/shop",
                element: <Shop />
            },
            {
                path: "/about",
                element: <About />
            },
            {
                path: "/blog",
                element: <Blog />
            },
            {
                path: "/book/:id",
                element: <SingleBook />,
                loader: async ({params}) => {
                    try {
                        // Use fetch directly to have better control over error handling
                        // This prevents React Router from treating 404s as errors
                        const jwtToken = localStorage.getItem('jwtToken');
                        const headers = {
                            'Content-Type': 'application/json',
                        };
                        
                        // Add JWT token if available (book endpoint may not require auth, but we include it for consistency)
                        if (jwtToken) {
                            headers['Authorization'] = `Bearer ${jwtToken}`;
                        }
                        
                        const response = await fetch(`${config.API_URL}/book/${params.id}`, {
                            headers
                        });
                        
                        // Handle 404 gracefully without throwing - return null so component can handle it
                        if (response.status === 404) {
                            return null; // SingleBook component will show "Book not found"
                        }
                        
                        // For other HTTP errors, return null instead of throwing
                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                            console.error('Error loading book:', errorData.error || `HTTP error! status: ${response.status}`);
                            return null;
                        }
                        
                        return await response.json();
                    } catch (error) {
                        // Network errors or other unexpected errors - return null instead of throwing
                        console.error('Error loading book:', error);
                        return null; // Component will handle this gracefully
                    }
                },
                errorElement: <div className='mt-28 px-4 lg:px-24 flex justify-center items-center min-h-screen'>
                    <div className='text-center'>
                        <h2 className='text-2xl font-bold mb-4'>Error loading book</h2>
                        <Button onClick={() => window.location.href = '/shop'}>Back to Shop</Button>
                    </div>
                </div>
            },
            {
                path: "/cart",
                element: <Cart />
            },
            {
                path: "/checkout",
                element: <PrivateRoute><Checkout /></PrivateRoute>
            },
            {
                path: "/payment/success",
                element: <PaymentSuccess />
            },
            {
                path: "/payment/failed",
                element: <PaymentFailed />
            },
            {
                path: "/profile",
                element: <PrivateRoute><UserProfile /></PrivateRoute>
            },
            {
                path: "/orders",
                element: <PrivateRoute><Orders /></PrivateRoute>
            },
            {
                path: "/orders/:orderId",
                element: <PrivateRoute><OrderDetails /></PrivateRoute>
            },
            {
                path: "/wishlist",
                element: <PrivateRoute><Wishlist /></PrivateRoute>
            },
            {
                path: "/forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "/seller-request-form",
                element: <PrivateRoute><SellerRequestForm /></PrivateRoute>
            },
            {
                path: "/seller-requests",
                element: <PrivateRoute><SellerRequests /></PrivateRoute>
            },
            {
                path: "/seller/dashboard",
                element: <DashboardLayout />,
                children: [
                    {
                        index: true,
                        element: <PrivateRoute><SellerDashboard /></PrivateRoute>
                    }
                ]
            },
        ]
    },
    {
        path: "/admin/dashboard",
        element: <DashboardLayout />,
        children: [
            {
                path: "/admin/dashboard",
                element: <AdminRoute><Dashboard /></AdminRoute>
            },
            {
                path: "/admin/dashboard/upload",
                element: <AdminRoute><UploadBook /></AdminRoute>
            },
            {
                path: "/admin/dashboard/manage",
                element: <AdminRoute><ManageBooks /></AdminRoute>
            },
            {
                path: "/admin/dashboard/seller-requests",
                element: <AdminRoute><ManageSellerRequests /></AdminRoute>
            },
            {
                path: "/admin/dashboard/edit-books/:id",
                element: <AdminRoute><EditBooks /></AdminRoute>,
                loader: async ({params}) => {
                    try {
                        const response = await fetch(`${config.API_URL}/book/${params.id}`);
                        if (!response.ok) {
                            if (response.status === 404) {
                                throw new Response("Book not found", { status: 404 });
                            }
                            throw new Response("Failed to load book", { status: response.status });
                        }
                        return await response.json();
                    } catch (error) {
                        if (error instanceof Response) {
                            throw error;
                        }
                        throw new Response("Failed to load book", { status: 500 });
                    }
                }
            },
        ]
    },
    {
        path: "sign-up",
        element: <Signup />
    },
    {
        path: "login",
        element: <Login />
    },
    {
        path: "logout",
        element: <Logout />
    },
]);

export default router;