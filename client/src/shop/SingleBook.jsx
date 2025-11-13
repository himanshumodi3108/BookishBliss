import React, { useContext, useState, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartProvider';
import { AuthContext } from '../contexts/AuthProvider';
import { Button, Card, Spinner } from 'flowbite-react';
import showToast from '../utils/toast';
import Reviews from '../components/Reviews';
import apiClient from '../utils/api';
import { FaHeart } from 'react-icons/fa';

const SingleBook = () => {
    const book = useLoaderData();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [inWishlist, setInWishlist] = useState(false);

    if (!book) {
        return (
            <div className='mt-28 px-4 lg:px-24 flex justify-center items-center min-h-screen'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold mb-4'>Book not found</h2>
                    <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
                </div>
            </div>
        );
    }

    useEffect(() => {
        checkWishlist();
    }, [book, user]);

    const checkWishlist = async () => {
        if (!user || !book?._id) return;
        try {
            const wishlist = await apiClient.get('/wishlist');
            const isInWishlist = wishlist.some(item => item.bookId === book._id);
            setInWishlist(isInWishlist);
        } catch (error) {
            // Silently fail
        }
    };

    const handleAddToCart = () => {
        addToCart(book);
    };

    const handleWishlist = async () => {
        if (!user) {
            showToast.warning('Please login to add to wishlist');
            navigate('/login');
            return;
        }

        try {
            if (inWishlist) {
                await apiClient.delete(`/wishlist/${book._id}`);
                setInWishlist(false);
                showToast.success('Removed from wishlist');
            } else {
                await apiClient.post('/wishlist', { bookId: book._id });
                setInWishlist(true);
                showToast.success('Added to wishlist');
            }
        } catch (error) {
            showToast.error(error.message || 'Failed to update wishlist');
        }
    };

    return (
        <div className='mt-28 px-4 lg:px-24 py-12'>
            <div className='grid lg:grid-cols-2 gap-8'>
                <div>
                    <img 
                        src={book.imageURL} 
                        alt={book.bookTitle} 
                        className='w-full h-auto rounded-lg shadow-lg'
                    />
                </div>
                <div>
                    <h1 className='text-4xl font-bold mb-4'>{book.bookTitle}</h1>
                    <p className='text-xl text-gray-600 mb-4'>by {book.authorName}</p>
                    <p className='text-2xl font-bold text-blue-700 mb-4'>₹{book.price}</p>
                    
                    <div className='mb-6'>
                        <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>
                            {book.category}
                        </span>
                    </div>

                    <p className='text-gray-700 mb-6 leading-relaxed'>
                        {book.bookDescription}
                    </p>

                    <div className='space-y-4'>
                        <Button 
                            className='w-full bg-blue-700 hover:bg-blue-800'
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </Button>
                        <Button 
                            className='w-full'
                            color={inWishlist ? "failure" : "gray"}
                            onClick={handleWishlist}
                        >
                            <FaHeart className="mr-2" />
                            {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        </Button>
                        {book.bookPDFURL && (
                            <Button 
                                className='w-full'
                                color="gray"
                                onClick={() => window.open(book.bookPDFURL, '_blank')}
                            >
                                View PDF
                            </Button>
                        )}
                        <Button 
                            className='w-full'
                            color="light"
                            onClick={() => navigate('/shop')}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
            <Reviews bookId={book._id} />
        </div>
    );
}

export default SingleBook