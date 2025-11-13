import React, { useState, useEffect } from 'react';
import { Card, Spinner, Badge } from 'flowbite-react';
import apiClient from '../utils/api';
import showToast from '../utils/toast';

const SellerDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/analytics/seller');
      setAnalytics(data);
    } catch (error) {
      showToast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='px-4 py-8 flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className='px-4 py-8'>
        <Card>
          <div className='text-center py-12'>
            <p className='text-gray-600 text-lg'>No analytics data available.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='px-4 py-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-3xl font-bold'>My Seller Analytics</h1>
          <Badge color='blue' size='lg'>Seller Dashboard</Badge>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <Card>
            <div className='text-center'>
              <p className='text-gray-600 text-sm mb-2'>My Books</p>
              <p className='text-3xl font-bold text-blue-700'>{analytics.stats?.totalBooks || 0}</p>
            </div>
          </Card>
          <Card>
            <div className='text-center'>
              <p className='text-gray-600 text-sm mb-2'>Total Orders</p>
              <p className='text-3xl font-bold text-green-700'>{analytics.stats?.totalOrders || 0}</p>
            </div>
          </Card>
          <Card>
            <div className='text-center'>
              <p className='text-gray-600 text-sm mb-2'>Total Revenue</p>
              <p className='text-3xl font-bold text-purple-700'>₹{analytics.stats?.totalRevenue || '0.00'}</p>
            </div>
          </Card>
          <Card>
            <div className='text-center'>
              <p className='text-gray-600 text-sm mb-2'>Total Reviews</p>
              <p className='text-3xl font-bold text-orange-700'>{analytics.stats?.totalReviews || 0}</p>
            </div>
          </Card>
        </div>

        {/* My Books */}
        {analytics.books && analytics.books.length > 0 && (
          <Card className='mb-8'>
            <h2 className='text-2xl font-bold mb-4'>My Books</h2>
            <div className='grid gap-4'>
              {analytics.books.map((book) => (
                <div key={book._id} className='flex gap-4 p-4 border rounded-lg'>
                  <img
                    src={book.imageURL}
                    alt={book.bookTitle}
                    className='w-24 h-32 object-cover rounded'
                  />
                  <div className='flex-1'>
                    <h3 className='text-xl font-semibold'>{book.bookTitle}</h3>
                    <p className='text-gray-600'>by {book.authorName}</p>
                    <div className='flex gap-4 mt-2'>
                      <Badge color='gray'>{book.category}</Badge>
                      <span className='text-lg font-semibold text-blue-700'>₹{book.price}</span>
                      {book.orderCount > 0 && (
                        <span className='text-sm text-gray-600'>
                          {book.orderCount} order{book.orderCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {book.avgRating && (
                        <span className='text-sm text-gray-600'>
                          ⭐ {book.avgRating.toFixed(1)} ({book.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Orders */}
        {analytics.recentOrders && analytics.recentOrders.length > 0 && (
          <Card>
            <h2 className='text-2xl font-bold mb-4'>Recent Orders</h2>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left p-2'>Order ID</th>
                    <th className='text-left p-2'>Book</th>
                    <th className='text-left p-2'>Quantity</th>
                    <th className='text-left p-2'>Amount</th>
                    <th className='text-left p-2'>Date</th>
                    <th className='text-left p-2'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentOrders.map((order) => (
                    <tr key={order._id} className='border-b'>
                      <td className='p-2 font-mono text-sm'>{order._id.toString().substring(0, 8)}...</td>
                      <td className='p-2'>{order.bookTitle}</td>
                      <td className='p-2'>{order.quantity}</td>
                      <td className='p-2'>₹{order.amount}</td>
                      <td className='p-2 text-sm'>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className='p-2'>
                        <Badge color={order.paymentStatus === 'paid' ? 'success' : 'yellow'}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;

