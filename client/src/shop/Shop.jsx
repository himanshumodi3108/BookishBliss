import React, { useState, useEffect, useContext } from 'react';
import { Card, Spinner, TextInput, Select, Button } from "flowbite-react";
import { Link } from 'react-router-dom';
import apiClient from '../utils/api';
import showToast from '../utils/toast';
import { CartContext } from '../contexts/CartProvider';

const Shop = () => {
  const { addToCart } = useContext(CartContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
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

  const fetchBooks = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder
      });
      
      if (category) params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);

      const data = await apiClient.get(`/all-books?${params.toString()}`);
      setBooks(data.books || data); // Handle both old and new API format
      setPagination(data.pagination || {
        page,
        total: data.books?.length || data.length || 0,
        pages: 1
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast.error('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(1);
  }, [category, sortBy, sortOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(1);
  };

  const handlePageChange = (newPage) => {
    fetchBooks(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className='mt-50 px-4 lg:px-24 flex justify-center items-center min-h-screen'>
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className='mt-50 px-4 lg:px-24 flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <p className='text-red-600 text-xl mb-4'>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className='bg-blue-700 text-white px-4 py-2 rounded'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-50 px-4 lg:px-24'>
      <div className='text-5xl font-bold text-center mt-0'>
        <h2 className='py-12'>All Books</h2>
      </div>

      {/* Search and Filter Section */}
      <div className='mb-8 space-y-4'>
        <form onSubmit={handleSearch} className='flex gap-4 flex-wrap'>
          <div className='flex-1 min-w-[200px]'>
            <TextInput
              type="text"
              placeholder="Search books by title, author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" className='bg-blue-700'>Search</Button>
        </form>

        <div className='flex gap-4 flex-wrap'>
          <div className='min-w-[150px]'>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
          <div className='min-w-[150px]'>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Date Added</option>
              <option value="bookTitle">Title</option>
              <option value="price">Price</option>
            </Select>
          </div>
          <div className='min-w-[120px]'>
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </div>
        </div>
      </div>

      {books.length === 0 && !loading ? (
        <div className='text-center py-12'>
          <p className='text-gray-600 text-xl'>No books found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className='grid gap-8 lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 grid-cols-1'>
            {books.map(book => (
              <Card key={book._id} className="max-w-sm">
                <img src={book.imageURL} alt={book.bookTitle} className='h-64 object-cover w-full' />
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {book.bookTitle}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400 line-clamp-2">
                  {book.bookDescription || 'No description available.'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{book.price}
                </p>
                <div className='space-y-2'>
                  <Link 
                    to={`/book/${book._id}`}
                    className='bg-blue-700 font-semibold text-white py-2 rounded text-center block hover:bg-blue-800 transition'
                  >
                    View Details
                  </Link>
                  <Button 
                    className='w-full bg-green-600 hover:bg-green-700'
                    onClick={() => addToCart(book)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className='flex justify-center items-center gap-4 mt-8'>
              <Button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className='bg-blue-700'
              >
                Previous
              </Button>
              <span className='text-gray-700'>
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className='bg-blue-700'
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Shop