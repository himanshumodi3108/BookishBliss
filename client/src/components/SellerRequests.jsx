import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import showToast from '../utils/toast';

const SellerRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/seller-requests/my-requests');
      setRequests(data);
    } catch (error) {
      showToast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Pending Review' },
      approved: { color: 'success', text: 'Approved' },
      rejected: { color: 'failure', text: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className='mt-28 px-4 lg:px-24 py-12 flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );
  }

  return (
    <div className='mt-28 px-4 lg:px-24 py-12'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold'>My Seller Requests</h1>
          <Button onClick={() => navigate('/seller-request-form')} className='bg-blue-700 hover:bg-blue-800'>
            Submit New Request
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card>
            <div className='text-center py-12'>
              <p className='text-gray-600 text-lg mb-4'>You haven't submitted any seller requests yet.</p>
              <Button onClick={() => navigate('/seller-request-form')} className='bg-blue-700 hover:bg-blue-800'>
                Submit Your First Request
              </Button>
            </div>
          </Card>
        ) : (
          <div className='grid gap-6'>
            {requests.map((request) => (
              <Card key={request._id}>
                <div className='flex flex-col md:flex-row gap-4'>
                  <div className='md:w-32 flex-shrink-0'>
                    <img
                      src={request.imageURL}
                      alt={request.bookTitle}
                      className='w-full h-48 object-cover rounded-lg'
                    />
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between items-start mb-2'>
                      <h2 className='text-2xl font-bold'>{request.bookTitle}</h2>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className='text-gray-600 mb-2'>by {request.authorName}</p>
                    <p className='text-lg font-semibold text-blue-700 mb-2'>₹{request.price}</p>
                    <p className='text-gray-700 mb-2'>{request.bookDescription.substring(0, 150)}...</p>
                    <div className='flex gap-2 mt-4'>
                      <Badge color='gray'>{request.category}</Badge>
                      <span className='text-sm text-gray-500'>
                        Submitted: {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {request.adminResponse && (
                      <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
                        <p className='text-sm font-semibold mb-1'>Admin Response:</p>
                        <p className='text-sm text-gray-700'>{request.adminResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerRequests;

