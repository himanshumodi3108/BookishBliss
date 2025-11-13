import React, { useEffect, useState } from "react";
import BookCards from "../components/BookCards";
import apiClient from '../utils/api';

const OtherBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await apiClient.get('/all-books?limit=10');
        // Handle both old array format and new object format
        const booksArray = Array.isArray(data) ? data : (data.books || []);
        setBooks(booksArray.slice(1, 10));
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    fetchBooks();
  }, []);
  return (
    <div>
      <BookCards books={books} headline="Other Books" />
    </div>
  );
};

export default OtherBooks;
