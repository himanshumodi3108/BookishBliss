import React, { useState, useEffect } from 'react';
import { Card } from "flowbite-react";

const Shop = () => {
  const [books, setBooks] = useState([]);

  useEffect(() =>{
    fetch("http://localhost:5000/all-books").then(res => res.json()).then(data => setBooks(data));
  }, [])
  return (
    <div className='mt-50 px-4 lg:px-24'>
      <div className='text-5xl font-bold text-center mt-0'>
        <h2 className='py-24'>All Books are here</h2>
      </div>

      <div className='grid gap-8 lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 grid-cols-1'>
        {
          books.map(book => <Card>
            <img src={book.imageURL} alt="" className='h-auto' />
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              <p>
                {book.bookTitle}
              </p>
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              <p>
              Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
              </p>
            </p>
            <button className='bg-blue-700 font-semibold text-white py-2 rounded'>Buy Now</button>
          </Card>)
        }
      </div>
    </div>
  )
}

export default Shop