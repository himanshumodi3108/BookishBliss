import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button } from 'flowbite-react';
import { FaCheckCircle } from 'react-icons/fa';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  return (
    <div className='min-h-screen px-4 lg:px-24 py-12 flex items-center justify-center'>
      <Card className='max-w-md w-full text-center'>
        <FaCheckCircle className='text-green-500 text-6xl mx-auto mb-4' />
        <h2 className='text-3xl font-bold mb-4 text-green-600'>Payment Successful!</h2>
        <p className='text-gray-600 mb-4'>Your order has been placed successfully.</p>
        {orderId && (
          <p className='text-sm text-gray-500 mb-6'>Order ID: {orderId}</p>
        )}
        <div className='space-y-2'>
          {orderId && (
            <Link to={`/orders/${orderId}`}>
              <Button className='w-full bg-blue-700'>View Order</Button>
            </Link>
          )}
          <Link to="/orders">
            <Button className='w-full' color="gray">My Orders</Button>
          </Link>
          <Link to="/shop">
            <Button className='w-full' color="light">Continue Shopping</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;



