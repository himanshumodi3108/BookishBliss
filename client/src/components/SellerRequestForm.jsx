import React, { useState, useEffect, useContext } from 'react';
import { Button, Label, TextInput, Textarea, Select, Card, Spinner, Alert } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';
import showToast from '../utils/toast';
import { AuthContext } from '../contexts/AuthProvider';

const SellerRequestForm = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [checkingSeller, setCheckingSeller] = useState(true);
  const [isApprovedSeller, setIsApprovedSeller] = useState(false);

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!user) {
        setCheckingSeller(false);
        return;
      }

      try {
        const sellerStatus = await apiClient.get('/seller/status');
        if (sellerStatus.isSeller) {
          setIsApprovedSeller(true);
          showToast.info('You are already an approved seller. Redirecting to seller dashboard...');
          setTimeout(() => {
            navigate('/seller/dashboard', { replace: true });
          }, 2000);
        }
      } catch (error) {
        // If check fails, allow access to form
        console.error('Error checking seller status:', error);
      } finally {
        setCheckingSeller(false);
      }
    };

    checkSellerStatus();
  }, [user, navigate]);
  const [formData, setFormData] = useState({
    // Seller Details
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
    sellerAddress: '',
    sellerCity: '',
    sellerState: '',
    sellerPincode: '',
    sellerBusinessName: '',
    sellerGSTIN: '',
    // Book Details
    bookTitle: '',
    authorName: '',
    category: '',
    bookDescription: '',
    price: '',
    imageURL: '',
    bookPDFURL: '',
    additionalNotes: ''
  });

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Programming",
    "Science Fiction",
    "Fantasy",
    "Horror",
    "Bibliography",
    "Romance",
    "Autobiography",
    "History",
    "Self-help",
    "Memoir",
    "Business",
    "Children Books",
    "Travel",
    "Religion",
    "Art and Design"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate seller details
      if (!formData.sellerName || !formData.sellerEmail || !formData.sellerPhone || 
          !formData.sellerAddress || !formData.sellerCity || !formData.sellerState || !formData.sellerPincode) {
        showToast.error('Please fill in all required seller information');
        setLoading(false);
        return;
      }

      // Validate book details
      if (!formData.bookTitle || !formData.authorName || !formData.category || 
          !formData.bookDescription || !formData.price || !formData.imageURL || !formData.bookPDFURL) {
        showToast.error('Please fill in all required book information');
        setLoading(false);
        return;
      }

      // Validate price
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        showToast.error('Please enter a valid price');
        setLoading(false);
        return;
      }

      await apiClient.post('/seller-requests', {
        ...formData,
        price: price
      });

      showToast.success('Book selling request submitted successfully! Admin will review it soon.');
      navigate('/seller-requests');
    } catch (error) {
      showToast.error(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSeller) {
    return (
      <div className='mt-28 px-4 lg:px-24 py-12 flex justify-center items-center min-h-screen'>
        <Spinner size="xl" />
      </div>
    );
  }

  if (isApprovedSeller) {
    return (
      <div className='mt-28 px-4 lg:px-24 py-12'>
        <div className='max-w-3xl mx-auto'>
          <Card>
            <Alert color="info" className='mb-4'>
              <span className="font-medium">Already Approved:</span> You are already an approved seller. Redirecting to your seller dashboard...
            </Alert>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-28 px-4 lg:px-24 py-12'>
      <div className='max-w-3xl mx-auto'>
        <Card>
          <h1 className='text-3xl font-bold mb-6 text-center'>Become a Seller</h1>
          <p className='text-gray-600 mb-6 text-center'>
            Fill out the form below to become a seller. Once approved, you'll be able to sell multiple books and access your seller dashboard.
          </p>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
            <p className='text-sm text-blue-800'>
              <strong>Note:</strong> This form is for initial seller approval only. Once approved, you can upload books directly through the dashboard without needing approval for each book.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Seller Details Section */}
            <div className='border-t border-b py-6'>
              <h2 className='text-2xl font-semibold mb-4'>Seller Information</h2>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='sellerName' value='Full Name *' />
                  <TextInput
                    id='sellerName'
                    name='sellerName'
                    type='text'
                    placeholder='Enter your full name'
                    value={formData.sellerName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='sellerEmail' value='Email *' />
                  <TextInput
                    id='sellerEmail'
                    name='sellerEmail'
                    type='email'
                    placeholder='Enter your email'
                    value={formData.sellerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='sellerPhone' value='Phone Number *' />
                  <TextInput
                    id='sellerPhone'
                    name='sellerPhone'
                    type='tel'
                    placeholder='Enter your phone number'
                    value={formData.sellerPhone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='sellerBusinessName' value='Business Name (Optional)' />
                  <TextInput
                    id='sellerBusinessName'
                    name='sellerBusinessName'
                    type='text'
                    placeholder='Enter business name if applicable'
                    value={formData.sellerBusinessName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor='sellerAddress' value='Address *' />
                  <Textarea
                    id='sellerAddress'
                    name='sellerAddress'
                    placeholder='Enter your address'
                    rows={2}
                    value={formData.sellerAddress}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='sellerCity' value='City *' />
                  <TextInput
                    id='sellerCity'
                    name='sellerCity'
                    type='text'
                    placeholder='Enter your city'
                    value={formData.sellerCity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='sellerState' value='State *' />
                  <TextInput
                    id='sellerState'
                    name='sellerState'
                    type='text'
                    placeholder='Enter your state'
                    value={formData.sellerState}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='sellerPincode' value='Pincode *' />
                  <TextInput
                    id='sellerPincode'
                    name='sellerPincode'
                    type='text'
                    placeholder='Enter pincode'
                    value={formData.sellerPincode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor='sellerGSTIN' value='GSTIN (Optional)' />
                  <TextInput
                    id='sellerGSTIN'
                    name='sellerGSTIN'
                    type='text'
                    placeholder='Enter GSTIN if applicable'
                    value={formData.sellerGSTIN}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Book Details Section */}
            <div className='border-b py-6'>
              <h2 className='text-2xl font-semibold mb-4'>Book Information</h2>
              
              <div className='space-y-4'>
            <div>
              <Label htmlFor='bookTitle' value='Book Title *' />
              <TextInput
                id='bookTitle'
                name='bookTitle'
                type='text'
                placeholder='Enter book title'
                value={formData.bookTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor='authorName' value='Author Name *' />
              <TextInput
                id='authorName'
                name='authorName'
                type='text'
                placeholder='Enter author name'
                value={formData.authorName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor='category' value='Category *' />
              <Select
                id='category'
                name='category'
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value=''>Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor='price' value='Price (₹) *' />
              <TextInput
                id='price'
                name='price'
                type='number'
                step='0.01'
                min='0'
                placeholder='Enter price'
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor='imageURL' value='Book Cover Image URL *' />
              <TextInput
                id='imageURL'
                name='imageURL'
                type='url'
                placeholder='https://example.com/book-cover.jpg'
                value={formData.imageURL}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor='bookPDFURL' value='Book PDF URL *' />
              <TextInput
                id='bookPDFURL'
                name='bookPDFURL'
                type='url'
                placeholder='https://example.com/book.pdf'
                value={formData.bookPDFURL}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor='bookDescription' value='Book Description *' />
              <Textarea
                id='bookDescription'
                name='bookDescription'
                placeholder='Enter a detailed description of the book (min 10 characters)'
                rows={6}
                value={formData.bookDescription}
                onChange={handleChange}
                required
                minLength={10}
              />
            </div>

            <div>
              <Label htmlFor='additionalNotes' value='Additional Notes (Optional)' />
              <Textarea
                id='additionalNotes'
                name='additionalNotes'
                placeholder='Any additional information you want to share with the admin'
                rows={4}
                value={formData.additionalNotes}
                onChange={handleChange}
              />
            </div>
              </div>
            </div>

            <div className='flex gap-4'>
              <Button
                type='submit'
                className='flex-1 bg-blue-700 hover:bg-blue-800'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size='sm' className='mr-2' />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
              <Button
                type='button'
                color='gray'
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SellerRequestForm;

