import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

import { Avatar } from "flowbite-react";
import { Rating } from "flowbite-react";
import proPic from "../assets/profile.jpg";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

//import './styles.css';

// import required modules
import { Pagination } from 'swiper/modules';

const Review = () => {
  return (
    <div className='my-12 px-4 lg:px-24'>
        <h2 className='text-5xl font-bold text-center mb-10 leading-snug'>Our Customers</h2>
        <div>
            <Swiper
                slidesPerView={1}
                spaceBetween={30}
                pagination={{
                clickable: true,
                }}
                breakpoints={{
                640: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 40,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 50,
                },
                }}
                modules={[Pagination]}
                className="mySwiper"
            >
                <SwiperSlide className='shadow-2xl bg-white py-8 px-4 md:m-5 rounded-lg border'>
                    <div className='space-y-6'>
                        <div className='text-amber-500 flex gap-2'>
                        <Rating>
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star filled={false} />
                        </Rating>
                        </div>

                        {/* Comment */}
                        <div className='mt-7'>
                            <p className='mb-5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                            Fuga totam veniam ab odio saepe laudantium, repellendus quae, 
                            hic possimus error cumque, fugit suscipit. Voluptatum suscipit 
                            velit aliquid sed facilis animi!</p>
                            <Avatar img={proPic} alt="avatar of Jese" rounded  className='w-10 mb-4'/>
                            <h5 className='text-lg font-medium'>Naveen M</h5>
                            <p className='text-base'>MD, XYZ Ltd.</p>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide className='shadow-2xl bg-white py-8 px-4 md:m-5 rounded-lg border'>
                    <div className='space-y-6'>
                        <div className='text-amber-500 flex gap-2'>
                        <Rating>
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                        </Rating>
                        </div>

                        {/* Comment */}
                        <div className='mt-7'>
                            <p className='mb-5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                            Fuga totam veniam ab odio saepe laudantium, repellendus quae, 
                            hic possimus error cumque, fugit suscipit. Voluptatum suscipit 
                            velit aliquid sed facilis animi!</p>
                            <Avatar img={proPic} alt="avatar of Jese" rounded  className='w-10 mb-4'/>
                            <h5 className='text-lg font-medium'>Himanshu</h5>
                            <p className='text-base'>CEO, ABC Corp. Ltd</p>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide className='shadow-2xl bg-white py-8 px-4 md:m-5 rounded-lg border'>
                    <div className='space-y-6'>
                        <div className='text-amber-500 flex gap-2'>
                        <Rating>
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star filled={false} />
                            <Rating.Star filled={false} />
                        </Rating>
                        </div>

                        {/* Comment */}
                        <div className='mt-7'>
                            <p className='mb-5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                            Fuga totam veniam ab odio saepe laudantium, repellendus quae, 
                            hic possimus error cumque, fugit suscipit. Voluptatum suscipit 
                            velit aliquid sed facilis animi!</p>
                            <Avatar img={proPic} alt="avatar of Jese" rounded  className='w-10 mb-4'/>
                            <h5 className='text-lg font-medium'>Rajiv Gupta</h5>
                            <p className='text-base'>CFO, DEF Pvt. Ltd.</p>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide className='shadow-2xl bg-white py-8 px-4 md:m-5 rounded-lg border'>
                    <div className='space-y-6'>
                        <div className='text-amber-500 flex gap-2'>
                        <Rating>
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                        </Rating>
                        </div>

                        {/* Comment */}
                        <div className='mt-7'>
                            <p className='mb-5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                            Fuga totam veniam ab odio saepe laudantium, repellendus quae, 
                            hic possimus error cumque, fugit suscipit. Voluptatum suscipit 
                            velit aliquid sed facilis animi!</p>
                            <Avatar img={proPic} alt="avatar of Jese" rounded  className='w-10 mb-4'/>
                            <h5 className='text-lg font-medium'>Rakesh Kumar</h5>
                            <p className='text-base'>MD, PQR Ltd.</p>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide className='shadow-2xl bg-white py-8 px-4 md:m-5 rounded-lg border'>
                    <div className='space-y-6'>
                        <div className='text-amber-500 flex gap-2'>
                        <Rating>
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star filled={false} />
                        </Rating>
                        </div>

                        {/* Comment */}
                        <div className='mt-7'>
                            <p className='mb-5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                            Fuga totam veniam ab odio saepe laudantium, repellendus quae, 
                            hic possimus error cumque, fugit suscipit. Voluptatum suscipit 
                            velit aliquid sed facilis animi!</p>
                            <Avatar img={proPic} alt="avatar of Jese" rounded  className='w-10 mb-4'/>
                            <h5 className='text-lg font-medium'>Antony Xavier</h5>
                            <p className='text-base'>CEO, Meta</p>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide className='shadow-2xl bg-white py-8 px-4 md:m-5 rounded-lg border'>
                    <div className='space-y-6'>
                        <div className='text-amber-500 flex gap-2'>
                        <Rating>
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                            <Rating.Star />
                        </Rating>
                        </div>

                        {/* Comment */}
                        <div className='mt-7'>
                            <p className='mb-5'>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                            Fuga totam veniam ab odio saepe laudantium, repellendus quae, 
                            hic possimus error cumque, fugit suscipit. Voluptatum suscipit 
                            velit aliquid sed facilis animi!</p>
                            <Avatar img={proPic} alt="avatar of Jese" rounded  className='w-10 mb-4'/>
                            <h5 className='text-lg font-medium'>David Smith</h5>
                            <p className='text-base'>COO, AZY Ltd.</p>
                        </div>
                    </div>
                </SwiperSlide>
                
            </Swiper>
        </div>
    </div>


  )
}

export default Review