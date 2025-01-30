import React, { useEffect, useState } from 'react';
import BookCards from '../components/BookCards';
import config from '../config/config';

const BestSellerBooks = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch(`${config.API_URL}/all-books`)
            .then(res => res.json())
            .then(data => setBooks(data.slice(0, 6)))
            .catch(error => console.error('Error fetching books:', error));
    }, [])
    
    return (
        <div>
            <BookCards books={books} headline="Best Seller Books" />
        </div>
    )
}

export default BestSellerBooks