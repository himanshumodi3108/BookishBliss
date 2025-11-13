import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Button } from 'flowbite-react';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className='min-h-screen px-4 lg:px-24 py-12 flex items-center justify-center'>
      <Card className='max-w-md w-full text-center'>
        <FaTimesCircle className='text-red-500 text-6xl mx-auto mb-4' />
        <h2 className='text-3xl font-bold mb-4 text-red-600'>Payment Failed</h2>
        <p className='text-gray-600 mb-4'>Your payment could not be processed. Please try again.</p>
        {orderId && (
          <p className='text-sm text-gray-500 mb-6'>Order ID: {orderId}</p>
        )}
        <div className='space-y-2'>
          <Link to="/cart">
            <Button className='w-full bg-blue-700'>Try Again</Button>
          </Link>
          <Link to="/shop">
            <Button className='w-full' color="light">Continue Shopping</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default PaymentFailed;



