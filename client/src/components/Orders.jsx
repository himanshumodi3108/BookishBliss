import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import { Link } from 'react-router-dom';
import { Card, Spinner, Badge } from 'flowbite-react';
import apiClient from '../utils/api';
import showToast from '../utils/toast';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiClient.get('/orders');
        setOrders(data);
      } catch (error) {
        showToast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'failure';
      default:
        return 'gray';
    }
  };

  if (!user) {
    return (
      <div className='min-h-screen px-4 lg:px-24 py-12 text-center'>
        <p className='text-gray-600 text-xl mb-4'>Please login to view your orders</p>
        <Link to="/login" className='bg-blue-700 text-white px-6 py-2 rounded inline-block'>
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='min-h-screen px-4 lg:px-24 py-12 flex justify-center items-center'>
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className='min-h-screen px-4 lg:px-24 py-12'>
      <h2 className='text-3xl font-bold mb-8'>My Orders</h2>
      
      {orders.length === 0 ? (
        <Card>
          <p className='text-center text-gray-600 py-8'>No orders found</p>
          <Link to="/shop" className='block text-center'>
            <button className='bg-blue-700 text-white px-6 py-2 rounded'>
              Start Shopping
            </button>
          </Link>
        </Card>
      ) : (
        <div className='space-y-4'>
          {orders.map(order => (
            <Card key={order._id}>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h3 className='text-xl font-bold'>Order #{order.orderId}</h3>
                  <p className='text-gray-600 text-sm'>
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className='text-right'>
                  <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
                  <p className='text-lg font-bold mt-2'>₹{order.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
              
              <div className='space-y-2 mb-4'>
                {order.items?.map((item, index) => (
                  <div key={index} className='flex justify-between text-sm'>
                    <span>{item.bookTitle} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {order.shippingAddress && (
                <div className='text-sm text-gray-600 mb-4'>
                  <p><strong>Shipping to:</strong> {order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                </div>
              )}
              
              <Link to={`/orders/${order.orderId}`}>
                <button className='text-blue-600 hover:underline'>
                  View Details
                </button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;



