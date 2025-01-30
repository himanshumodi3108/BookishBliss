import React, { useEffect, useState } from "react";
import BookCards from "../components/BookCards";
import config from '../config/config';

const OtherBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch(`${config.API_URL}/all-books`)
      .then((res) => res.json())
      .then((data) => setBooks(data.slice(1, 10)));
  }, []);
  return (
    <div>
      <BookCards books={books} headline="Other Books" />
    </div>
  );
};

export default OtherBooks;
