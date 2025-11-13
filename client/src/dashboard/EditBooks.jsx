import React, { useState, useEffect, useContext } from 'react';
import { useLoaderData, useParams, useNavigate } from 'react-router-dom';
import { Button, Label, TextInput, Textarea, Select, Spinner, Badge, Alert } from "flowbite-react";
import apiClient from '../utils/api';
import showToast from '../utils/toast';
import { AuthContext } from '../contexts/AuthProvider';
import { checkAdminStatus } from '../utils/checkAdmin';

const EditBooks = ({ isAdmin, isSeller }) => {
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
  const {id} = useParams();
  const navigate = useNavigate();
  const {bookTitle, authorName, imageURL, category, bookDescription, bookPDFURL, price} = useLoaderData();

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

  const [selectedBookCategory, setSelectedBookCategory] = useState(category || bookCategories[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setSelectedBookCategory(category);
    }
  }, [category]);

  const handleChangeSelectedValue = (event) => {
    setSelectedBookCategory(event.target.value);
  }

  //Handle Book Update
  const handleUpdate = async (event) => {
    event.preventDefault();
    const form = event.target;

    const bookTitle = form.bookTitle.value.trim();
    const authorName = form.authorName.value.trim();
    const imageURL = form.imageURL.value.trim();
    const category = form.categoryName.value;
    const bookDescription = form.bookDescription.value.trim();
    const bookPDFURL = form.bookPDFURL.value.trim();
    const price = parseFloat(form.price.value);

    // Basic validation
    if (!bookTitle || !authorName || !imageURL || !bookDescription || !bookPDFURL) {
      showToast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(price) || price <= 0) {
      showToast.error('Please enter a valid price');
      return;
    }

    const updateBookObj = {
      bookTitle, 
      authorName, 
      imageURL, 
      category, 
      bookDescription, 
      bookPDFURL, 
      price
    };

    try {
      setLoading(true);
      await apiClient.patch(`/book/${id}`, updateBookObj);
      showToast.success('Book updated successfully!');
      navigate('/admin/dashboard/manage');
    } catch (error) {
      showToast.error(error.message || 'Failed to update book. Please try again.');
    } finally {
      setLoading(false);
    }
  }


  const finalIsAdmin = isAdmin !== undefined ? isAdmin : userRole.isAdmin;
  const finalIsSeller = isSeller !== undefined ? isSeller : userRole.isSeller;

  return (
    <div className='px-4 my-12'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-3xl font-bold'>Update the book data</h2>
        <div className='flex gap-2'>
          {finalIsAdmin && <Badge color='green' size='lg'>Admin</Badge>}
          {finalIsSeller && !finalIsAdmin && <Badge color='blue' size='lg'>Seller</Badge>}
        </div>
      </div>
      
      {finalIsAdmin && (
        <Alert color="info" className='mb-6'>
          <span className="font-medium">Admin Access:</span> You can edit any book in the system.
        </Alert>
      )}
      
      {finalIsSeller && !finalIsAdmin && (
        <Alert color="info" className='mb-6'>
          <span className="font-medium">Seller Access:</span> You can edit your own books.
        </Alert>
      )}
      
      <form onSubmit={handleUpdate} className="flex lg:w-[1180px] flex-col flex-wrap gap-4">
        {/* First Row */}
        <div className='flex gap-8'>
          {/* Book Title */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="bookTitle" value="Book Title" />
            </div>
            <TextInput id="bookTitle" type="text" placeholder="Enter the Book Name" name="bookTitle" defaultValue={bookTitle} required />
          </div>
          {/* Author Name */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="authorName" value="Author Name" />
            </div>
            <TextInput id="authorName" type="text" placeholder="Enter the Author Name" name="authorName" defaultValue={authorName} required />
          </div>
        </div>

        {/* Second Row */}
        <div className='flex gap-8'>
          {/* Image URL */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="imageURL" value="Image URL" />
            </div>
            <TextInput 
              id="imageURL" 
              type="text" 
              placeholder="Enter the Book Image URL" 
              name="imageURL"
              defaultValue={imageURL} 
              required 
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
              defaultValue={category}
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
              defaultValue={bookPDFURL} 
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
              defaultValue={price} 
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
            defaultValue={bookDescription} 
            required 
            rows={5} 
          />
        </div>

        <Button type="submit" className='mt-5' disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Updating...
            </>
          ) : (
            'Update Book'
          )}
        </Button>
      </form>
    </div>
  )
}

export default EditBooks