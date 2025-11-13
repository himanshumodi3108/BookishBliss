import React, { useState, useEffect } from 'react';
import { Card, Spinner, Badge } from 'flowbite-react';
import apiClient from '../utils/api';
import showToast from '../utils/toast';
import { useLocation } from 'react-router-dom';

const Dashboard = ({ isAdmin, isSeller }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Get access level from route state or props
  const accessLevel = isAdmin !== undefined ? { isAdmin, isSeller } : location.state?.accessLevel || { isAdmin: true, isSeller: false };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Use seller analytics if user is seller but not admin
      if (accessLevel.isSeller && !accessLevel.isAdmin) {
        const data = await apiClient.get('/analytics/seller');
        setAnalytics(data);
      } else {
        // Admin sees full dashboard
        const data = await apiClient.get('/analytics/dashboard');
        setAnalytics(data);
      }
    } catch (error) {
      showToast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen px-4 lg:px-24 py-12 flex justify-center items-center'>
        <Spinner size="xl" />
      </div>
    );
  }

  if (!analytics) {
    return <div>No data available</div>;
  }

  const isSellerOnly = accessLevel.isSeller && !accessLevel.isAdmin;

  return (
    <div className='min-h-screen px-4 lg:px-24 py-12'>
      <div className='flex justify-between items-center mb-8'>
        <h2 className='text-3xl font-bold'>
          {isSellerOnly ? 'Seller Dashboard' : 'Analytics Dashboard'}
        </h2>
        {isSellerOnly && (
          <Badge color='blue' size='lg'>Seller View</Badge>
        )}
        {accessLevel.isAdmin && (
          <Badge color='green' size='lg'>Admin View</Badge>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isSellerOnly ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4 mb-8`}>
        <Card>
          <h3 className='text-sm text-gray-600 mb-2'>{isSellerOnly ? 'My Books' : 'Total Books'}</h3>
          <p className='text-3xl font-bold'>{analytics.stats.totalBooks}</p>
        </Card>
        <Card>
          <h3 className='text-sm text-gray-600 mb-2'>{isSellerOnly ? 'My Orders' : 'Total Orders'}</h3>
          <p className='text-3xl font-bold'>{analytics.stats.totalOrders}</p>
        </Card>
        {!isSellerOnly && (
          <Card>
            <h3 className='text-sm text-gray-600 mb-2'>Total Users</h3>
            <p className='text-3xl font-bold'>{analytics.stats.totalUsers}</p>
          </Card>
        )}
        <Card>
          <h3 className='text-sm text-gray-600 mb-2'>{isSellerOnly ? 'My Reviews' : 'Total Reviews'}</h3>
          <p className='text-3xl font-bold'>{analytics.stats.totalReviews}</p>
        </Card>
        <Card>
          <h3 className='text-sm text-gray-600 mb-2'>{isSellerOnly ? 'My Revenue' : 'Total Revenue'}</h3>
          <p className='text-3xl font-bold'>₹{analytics.stats.totalRevenue}</p>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className='mb-8'>
        <h3 className='text-2xl font-bold mb-4'>{isSellerOnly ? 'My Recent Orders' : 'Recent Orders'}</h3>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='text-left p-2'>{isSellerOnly ? 'Book' : 'Order ID'}</th>
                {!isSellerOnly && <th className='text-left p-2'>Customer</th>}
                <th className='text-left p-2'>Quantity</th>
                <th className='text-left p-2'>Amount</th>
                <th className='text-left p-2'>Status</th>
                <th className='text-left p-2'>Date</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentOrders?.map((order) => (
                <tr key={order._id} className='border-b'>
                  <td className='p-2'>{isSellerOnly ? order.bookTitle : (order.orderId || order._id.toString().substring(0, 8))}</td>
                  {!isSellerOnly && <td className='p-2'>{order.userEmail}</td>}
                  <td className='p-2'>{order.quantity || '-'}</td>
                  <td className='p-2'>₹{order.amount?.toFixed(2) || order.totalAmount?.toFixed(2)}</td>
                  <td className='p-2'>
                    <span className={`px-2 py-1 rounded text-sm ${
                      (order.paymentStatus === 'paid' || order.status === 'confirmed') ? 'bg-green-100 text-green-800' :
                      (order.status === 'pending' || order.paymentStatus === 'pending') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus || order.status}
                    </span>
                  </td>
                  <td className='p-2'>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Books Section */}
      {isSellerOnly && analytics.books && analytics.books.length > 0 && (
        <Card className='mb-8'>
          <h3 className='text-2xl font-bold mb-4'>My Books</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {analytics.books.map((book) => (
              <div key={book._id} className='border rounded p-4'>
                <img
                  src={book.imageURL}
                  alt={book.bookTitle}
                  className='w-full h-48 object-cover rounded mb-2'
                />
                <h4 className='font-bold text-sm mb-1'>{book.bookTitle}</h4>
                <p className='text-xs text-gray-600 mb-2'>by {book.authorName}</p>
                <p className='text-sm font-semibold text-blue-700 mb-2'>₹{book.price}</p>
                {book.avgRating && (
                  <p className='text-xs text-gray-600 mb-2'>
                    ⭐ {book.avgRating.toFixed(1)} ({book.reviewCount} reviews)
                  </p>
                )}
                {book.orderCount > 0 && (
                  <p className='text-xs text-gray-600'>{book.orderCount} order{book.orderCount !== 1 ? 's' : ''}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Popular Books (Admin only) */}
      {!isSellerOnly && (
        <Card>
          <h3 className='text-2xl font-bold mb-4'>Popular Books</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            {analytics.popularBooks?.map((item) => (
              <div key={item._id} className='border rounded p-4'>
                {item.book && (
                  <>
                    <img
                      src={item.book.imageURL}
                      alt={item.book.bookTitle}
                      className='w-full h-48 object-cover rounded mb-2'
                    />
                    <h4 className='font-bold text-sm mb-1'>{item.book.bookTitle}</h4>
                    <p className='text-xs text-gray-600 mb-2'>
                      {item.avgRating.toFixed(1)} ⭐ ({item.reviewCount} reviews)
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;