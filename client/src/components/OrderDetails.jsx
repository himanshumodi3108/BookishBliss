import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Spinner, Badge } from 'flowbite-react';
import apiClient from '../utils/api';
import showToast from '../utils/toast';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        showToast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className='min-h-screen px-4 lg:px-24 py-12 flex justify-center items-center'>
        <Spinner size="xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className='min-h-screen px-4 lg:px-24 py-12 text-center'>
        <p className='text-gray-600 text-xl mb-4'>Order not found</p>
        <Link to="/orders" className='bg-blue-700 text-white px-6 py-2 rounded inline-block'>
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className='min-h-screen px-4 lg:px-24 py-12'>
      <h2 className='text-3xl font-bold mb-8'>Order Details</h2>
      
      <Card>
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h3 className='text-2xl font-bold mb-2'>Order #{order.orderId}</h3>
            <p className='text-gray-600'>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className='text-right'>
            <Badge color={order.status === 'confirmed' ? 'success' : order.status === 'pending' ? 'warning' : 'failure'}>
              {order.status}
            </Badge>
            <p className='text-2xl font-bold mt-2'>₹{order.totalAmount?.toFixed(2)}</p>
          </div>
        </div>

        <div className='mb-6'>
          <h4 className='font-bold mb-2'>Order Items</h4>
          <div className='space-y-2'>
            {order.items?.map((item, index) => (
              <div key={index} className='flex justify-between p-2 bg-gray-50 rounded'>
                <div>
                  <p className='font-semibold'>{item.bookTitle}</p>
                  <p className='text-sm text-gray-600'>Quantity: {item.quantity}</p>
                </div>
                <p className='font-semibold'>₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {order.shippingAddress && (
          <div className='mb-6'>
            <h4 className='font-bold mb-2'>Shipping Address</h4>
            <div className='bg-gray-50 p-4 rounded'>
              <p>{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        )}

        <div className='flex gap-4'>
          <Link to="/orders">
            <button className='bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300'>
              Back to Orders
            </button>
          </Link>
          <Link to="/shop">
            <button className='bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800'>
              Continue Shopping
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetails;



