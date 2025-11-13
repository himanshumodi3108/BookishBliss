import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Textarea, Modal, Spinner, Select } from 'flowbite-react';
import apiClient from '../utils/api';
import showToast from '../utils/toast';

const ManageSellerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminResponse, setAdminResponse] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const data = await apiClient.get(`/seller-requests${params}`);
      setRequests(data);
    } catch (error) {
      showToast.error('Failed to load seller requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setAdminResponse('');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const endpoint = actionType === 'approve' 
        ? `/seller-requests/${selectedRequest._id}/approve`
        : `/seller-requests/${selectedRequest._id}/reject`;

      await apiClient.post(endpoint, {
        adminResponse: adminResponse || undefined
      });

      showToast.success(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      showToast.error(error.message || `Failed to ${actionType} request`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Pending' },
      approved: { color: 'success', text: 'Approved' },
      rejected: { color: 'failure', text: 'Rejected' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className='px-4 py-8 flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );
  }

  return (
    <div className='px-4 py-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold'>Manage Seller Requests</h1>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='w-48'
          >
            <option value='all'>All Requests</option>
            <option value='pending'>Pending</option>
            <option value='approved'>Approved</option>
            <option value='rejected'>Rejected</option>
          </Select>
        </div>

        {requests.length === 0 ? (
          <Card>
            <div className='text-center py-12'>
              <p className='text-gray-600 text-lg'>No seller requests found.</p>
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
                      <div>
                        <h2 className='text-2xl font-bold'>{request.bookTitle}</h2>
                        <p className='text-gray-600'>by {request.authorName}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className='grid md:grid-cols-2 gap-4 mb-4'>
                      <div>
                        <p className='text-sm text-gray-500'>Category</p>
                        <Badge color='gray'>{request.category}</Badge>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Price</p>
                        <p className='text-lg font-semibold text-blue-700'>₹{request.price}</p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Submitted</p>
                        <p className='text-sm'>{new Date(request.createdAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>User ID</p>
                        <p className='text-sm font-mono'>{request.userId}</p>
                      </div>
                    </div>
                    <div className='mb-4'>
                      <p className='text-sm text-gray-500 mb-1'>Description</p>
                      <p className='text-gray-700'>{request.bookDescription}</p>
                    </div>
                    {request.additionalNotes && (
                      <div className='mb-4'>
                        <p className='text-sm text-gray-500 mb-1'>Additional Notes</p>
                        <p className='text-gray-700'>{request.additionalNotes}</p>
                      </div>
                    )}
                    {request.adminResponse && (
                      <div className='mb-4 p-3 bg-gray-50 rounded-lg'>
                        <p className='text-sm font-semibold mb-1'>Admin Response:</p>
                        <p className='text-sm text-gray-700'>{request.adminResponse}</p>
                      </div>
                    )}
                    {request.status === 'pending' && (
                      <div className='flex gap-3 mt-4'>
                        <Button
                          color='success'
                          onClick={() => handleAction(request, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          color='failure'
                          onClick={() => handleAction(request, 'reject')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>
          {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
        </Modal.Header>
        <Modal.Body>
          <div className='space-y-4'>
            <p>
              Are you sure you want to {actionType} this request? 
              {actionType === 'approve' && ' This will create a new book in the store.'}
            </p>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Admin Response (Optional)
              </label>
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder={`Enter a message for the seller...`}
                rows={4}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color={actionType === 'approve' ? 'success' : 'failure'}
            onClick={confirmAction}
            disabled={processing}
          >
            {processing ? (
              <>
                <Spinner size='sm' className='mr-2' />
                Processing...
              </>
            ) : (
              `Confirm ${actionType === 'approve' ? 'Approve' : 'Reject'}`
            )}
          </Button>
          <Button color='gray' onClick={() => setShowModal(false)} disabled={processing}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageSellerRequests;

