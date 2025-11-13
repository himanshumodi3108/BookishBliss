import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Spinner, Button } from 'flowbite-react';
import apiClient from '../utils/api';
import showToast from '../utils/toast';
import { CartContext } from '../contexts/CartProvider';
import { FaHeart, FaTrash } from 'react-icons/fa';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/wishlist');
      setWishlist(data);
    } catch (error) {
      showToast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId) => {
    try {
      await apiClient.delete(`/wishlist/${bookId}`);
      showToast.success('Removed from wishlist');
      fetchWishlist();
    } catch (error) {
      showToast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (book) => {
    addToCart(book);
    showToast.success('Added to cart!');
  };

  if (!user) {
    return (
      <div className='min-h-screen px-4 lg:px-24 py-12 text-center'>
        <p className='text-gray-600 text-xl mb-4'>Please login to view your wishlist</p>
        <Button onClick={() => navigate('/login')} className='bg-blue-700'>
          Login
        </Button>
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
      <h2 className='text-3xl font-bold mb-8'>My Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <Card>
          <div className='text-center py-12'>
            <FaHeart className='text-gray-400 text-6xl mx-auto mb-4' />
            <p className='text-gray-600 text-xl mb-4'>Your wishlist is empty</p>
            <Link to="/shop">
              <Button className='bg-blue-700'>Start Shopping</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className='grid gap-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1'>
          {wishlist.map((item) => (
            <Card key={item._id} className="relative">
              <button
                onClick={() => handleRemove(item.bookId)}
                className='absolute top-2 right-2 text-red-500 hover:text-red-700'
              >
                <FaTrash />
              </button>
              
              {item.book && (
                <>
                  <img
                    src={item.book.imageURL}
                    alt={item.book.bookTitle}
                    className='h-64 object-cover w-full mb-4'
                  />
                  <h3 className='text-lg font-bold mb-2'>{item.book.bookTitle}</h3>
                  <p className='text-gray-600 mb-2'>by {item.book.authorName}</p>
                  <p className='text-xl font-bold mb-4'>₹{item.book.price}</p>
                  
                  <div className='space-y-2'>
                    <Link to={`/book/${item.bookId}`} className='block'>
                      <Button className='w-full bg-blue-700'>View Details</Button>
                    </Link>
                    <Button
                      className='w-full'
                      color="gray"
                      onClick={() => handleAddToCart(item.book)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;



