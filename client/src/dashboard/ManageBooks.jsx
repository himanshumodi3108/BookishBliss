import React, { useEffect, useState, useContext } from 'react';
import { Table, Spinner, Badge, Alert } from "flowbite-react";
import { Link } from 'react-router-dom';
import apiClient from '../utils/api';
import showToast from '../utils/toast';
import { AuthContext } from '../contexts/AuthProvider';

const ManageBooks = ({ isAdmin, isSeller }) => {
  const { user } = useContext(AuthContext);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        // If seller (not admin), fetch only their books
        if (isSeller && !isAdmin) {
          const data = await apiClient.get('/books/seller?limit=1000');
          setAllBooks(data.books || data);
        } else {
          // Admin sees all books
          const data = await apiClient.get('/all-books?limit=1000');
          setAllBooks(data.books || data);
        }
      } catch (error) {
        showToast.error('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [isAdmin, isSeller]);

  //Delete a book
  const handleDelete = async (id, bookTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await apiClient.delete(`/book/${id}`);
      setAllBooks(allBooks.filter(book => book._id !== id));
      showToast.success('Book deleted successfully!');
    } catch (error) {
      showToast.error(error.message || 'Failed to delete book. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className='px-4 my-12 flex justify-center items-center min-h-screen'>
        <Spinner size="xl" />
      </div>
    );
  }


  return (
    <div className='px-4 my-12'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-3xl font-bold'>
          {isSeller && !isAdmin ? 'My Books' : 'Manage All Books'}
        </h2>
        <div className='flex gap-2'>
          {isAdmin && <Badge color='green' size='lg'>Admin</Badge>}
          {isSeller && !isAdmin && <Badge color='blue' size='lg'>Seller</Badge>}
        </div>
      </div>

      {isAdmin && (
        <Alert color="info" className='mb-6'>
          <span className="font-medium">Admin Access:</span> You can view, edit, and delete any book in the system.
        </Alert>
      )}

      {isSeller && !isAdmin && (
        <Alert color="info" className='mb-6'>
          <span className="font-medium">Seller Access:</span> You can view, edit, and delete only your own books.
        </Alert>
      )}

      {/* Table for book data */}
      <Table className='lg:w-[1180px]'>
        <Table.Head>
        <Table.HeadCell>S. No.</Table.HeadCell>
          <Table.HeadCell>Book Name</Table.HeadCell>
          <Table.HeadCell>Author Name</Table.HeadCell>
          <Table.HeadCell>Category</Table.HeadCell>
          <Table.HeadCell>Price</Table.HeadCell>
          <Table.HeadCell>
            <span>Edit or Manage</span>
          </Table.HeadCell>
        </Table.Head>
        {
          allBooks.map((book, index) => <Table.Body className="divide-y" key={book._id}>
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {index + 1}
              </Table.Cell>
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {book.bookTitle}
              </Table.Cell>
              <Table.Cell>{book.authorName}</Table.Cell>
              <Table.Cell>{book.category}</Table.Cell>
              <Table.Cell>{book.price}</Table.Cell>
              <Table.Cell>
                <Link 
                  className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 mr-5"
                  to={`/admin/dashboard/edit-books/${book._id}`}
                >
                  Edit
                </Link>
                

                <button 
                  onClick={() => handleDelete(book._id, book.bookTitle)} 
                  className='bg-red-600 px-4 py-1 font-semibold text-white rounded-sm hover:bg-red-700 disabled:opacity-50'
                  disabled={deletingId === book._id}
                >
                  {deletingId === book._id ? 'Deleting...' : 'Delete'}
                </button>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        )}
      </Table>


    </div>
  )
}

export default ManageBooks