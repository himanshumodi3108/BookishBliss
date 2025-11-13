import React, { useState, useContext, useEffect } from 'react';
import { Button, Label, TextInput, Textarea, Select, Spinner, Badge, Alert } from "flowbite-react";
import apiClient from '../utils/api';
import showToast from '../utils/toast';
import { useDropzone } from 'react-dropzone';
import { getAuth } from 'firebase/auth';
import config from '../config/config';
import { AuthContext } from '../contexts/AuthProvider';
import { checkAdminStatus } from '../utils/checkAdmin';

const UploadBook = ({ isAdmin, isSeller }) => {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState({ isAdmin: false, isSeller: false });

  useEffect(() => {
    const checkRole = async () => {
      if (user) {
        const adminStatus = await checkAdminStatus(user);
        try {
          const sellerStatus = await apiClient.get('/seller/status');
          setUserRole({ isAdmin: adminStatus, isSeller: sellerStatus.isSeller || false });
        } catch (error) {
          setUserRole({ isAdmin: adminStatus, isSeller: false });
        }
      }
    };
    checkRole();
  }, [user]);
  const bookCategories = [
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
  ]

  const [selectedBookCategory, setSelectedBookCategory] = useState(bookCategories[0]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageURL, setImageURL] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Upload image
      try {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);
        
        const auth = getAuth();
        const user = auth.currentUser;
        const token = await user.getIdToken();
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || config.API_URL}/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const data = await response.json();
        if (data.imageUrl) {
          setImageURL(data.imageUrl);
          showToast.success('Image uploaded successfully!');
        }
      } catch (error) {
        showToast.error('Failed to upload image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  const handleChangeSelectedValue = (event) => {
    setSelectedBookCategory(event.target.value);
  }

  //Handle Book Upload
  const handleBookUpload = async (event) => {
    event.preventDefault();
    const form = event.target;

    const bookTitle = form.bookTitle.value.trim();
    const authorName = form.authorName.value.trim();
    const finalImageURL = imageURL || form.imageURL.value.trim();
    const category = form.categoryName.value;
    const bookDescription = form.bookDescription.value.trim();
    const bookPDFURL = form.bookPDFURL.value.trim();
    const price = parseFloat(form.price.value);

    // Basic validation
    if (!bookTitle || !authorName || !finalImageURL || !bookDescription || !bookPDFURL) {
      showToast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(price) || price <= 0) {
      showToast.error('Please enter a valid price');
      return;
    }

    const bookObj = {
      bookTitle, 
      authorName, 
      imageURL: finalImageURL, 
      category, 
      bookDescription, 
      bookPDFURL, 
      price
    };

    try {
      setLoading(true);
      await apiClient.post('/upload-book', bookObj);
      const successMessage = finalIsSeller && !finalIsAdmin 
        ? 'Book uploaded and published successfully!' 
        : 'Book uploaded successfully!';
      showToast.success(successMessage);
      form.reset();
      setSelectedBookCategory(bookCategories[0]);
      setImageURL('');
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      showToast.error(error.message || 'Failed to upload book. Please try again.');
    } finally {
      setLoading(false);
    }
  }


  const finalIsAdmin = isAdmin !== undefined ? isAdmin : userRole.isAdmin;
  const finalIsSeller = isSeller !== undefined ? isSeller : userRole.isSeller;

  return (
    <div className='px-4 my-12'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-3xl font-bold'>Upload a book</h2>
        <div className='flex gap-2'>
          {finalIsAdmin && <Badge color='green' size='lg'>Admin</Badge>}
          {finalIsSeller && !finalIsAdmin && <Badge color='blue' size='lg'>Approved Seller</Badge>}
        </div>
      </div>
      
      {finalIsSeller && !finalIsAdmin && (
        <Alert color="info" className='mb-6'>
          <span className="font-medium">Approved Seller:</span> Your books will be published immediately without requiring admin approval.
        </Alert>
      )}
      
      <form onSubmit={handleBookUpload} className="flex lg:w-[1180px] flex-col flex-wrap gap-4">
        {/* First Row */}
        <div className='flex gap-8'>
          {/* Book Title */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="bookTitle" value="Book Title" />
            </div>
            <TextInput id="bookTitle" type="text" placeholder="Enter the Book Name" name="bookTitle" required />
          </div>
          {/* Author Name */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="authorName" value="Author Name" />
            </div>
            <TextInput id="authorName" type="text" placeholder="Enter the Author Name" name="authorName" required />
          </div>
        </div>

        {/* Second Row */}
        <div className='flex gap-8'>
          {/* Image Upload */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="imageURL" value="Book Image" />
            </div>
            <div {...getRootProps()} className={`border-2 border-dashed rounded p-4 text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
              <input {...getInputProps()} />
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click or drag to change image</p>
                </div>
              ) : (
                <div>
                  {uploadingImage ? (
                    <Spinner />
                  ) : (
                    <p className="text-gray-600">
                      {isDragActive ? 'Drop the image here' : 'Click or drag image to upload'}
                    </p>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">OR</p>
            <TextInput 
              id="imageURL" 
              type="text" 
              placeholder="Enter the Book Image URL" 
              name="imageURL"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
            />
          </div>
          {/* Category */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="inputState" value="Book Category" />
            </div>
            <Select 
              name="categoryName" 
              id="inputState" 
              className='w-full rounded' 
              value={selectedBookCategory}
              onChange={handleChangeSelectedValue}
            >
              {
                bookCategories.map((option) => <option key={option} value={option}>{option}</option>)
              }
            </Select>
          </div>
        </div>

        {/* Third Row */}
        <div className='flex gap-8'>
          {/* Book PDF URL */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="bookPDFURL" value="Book PDF URL" />
            </div>
            <TextInput 
              id="bookPDFURL" 
              type="text" 
              placeholder="Enter the Book PDF URL" 
              name="bookPDFURL" 
              required 
            />
          </div>

          {/* Book Price */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="price" value="Book Price (in INR)" />
            </div>
            <TextInput 
              id="price" 
              type="text" 
              placeholder="Enter the Book Price in INR" 
              name="price" 
              required 
            />
          </div>
        </div>

        {/* Book Description */}
        <div>
          <div className="mb-2 block">
            <Label 
              htmlFor="bookDescription" 
              value="Book Description" 
            />
          </div>
          <Textarea 
            id="bookDescription" 
            name="bookDescription" 
            placeholder="Write your book description..." 
            className='w-full' 
            required 
            rows={5} 
          />
        </div>

        <Button type="submit" className='mt-5' disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Uploading...
            </>
          ) : (
            'Upload Book'
          )}
        </Button>
      </form>
    </div>
  )
}

export default UploadBook