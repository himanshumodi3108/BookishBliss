import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

//import './styles.css';

// import required modules
import { Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';

import { FaCartShopping } from 'react-icons/fa6';

const BookCards = ({headline, books}) => {
  return (
    <div className='my-16 px-4 lg:px-24'>
        <h2 className='text-5xl text-center font-bold text-black my-5'>{headline}</h2>

        {/* Cards */ }
        <div className='mt-12'>
            <Swiper
                slidesPerView={1}
                spaceBetween={10}
                pagination={{
                clickable: true,
                }}
                breakpoints={{
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 40,
                },
                }}
                modules={[Pagination]}
                className="mySwiper w-full h-full"
            >
                {
                    books.map(book => <SwiperSlide key={book._id}>
                        <Link to={`/book/${book._id}`} className="block hover:shadow-xl transition-shadow duration-300">
                            <div className='relative'>
                                <img src={book.imageURL} alt="" className='w-full h-[320px] object-cover rounded-t-lg' />
                                <div className='absolute top-3 right-3 bg-blue-600 hover:bg-black p-2 rounded'>
                                    <FaCartShopping className='w-4 h-4 text-white' />
                                </div>
                            </div>
                            <div className='p-4 rounded-b-lg bg-gray-50'>
                                <div className='flex justify-between items-center gap-2 mb-2'>
                                    <h3 className='text-lg font-semibold text-gray-900 truncate flex-1'>{book.bookTitle}</h3>
                                    <p className='text-lg font-bold text-blue-600 whitespace-nowrap'>&#8377;{book.price}</p>
                                </div>
                                <p className='text-sm text-gray-600'>{book.authorName}</p>
                            </div>
                        </Link>
                    </SwiperSlide>)
                }
            </Swiper>
        </div>
    </div>
  )
}

export default BookCards