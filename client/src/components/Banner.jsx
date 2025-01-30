import React from 'react';
import BannerCard from '../home/BannerCard';

const Banner = () => {
  return (
    <div className='px-4 lg:px-24  bg-teal-100 flex items-center'>
        <div className='flex w-full flex-col md:flex-row justify-between items-center gap-12 py-40'>
            {/* Left Side */}
            <div className='md:w-1/2 space-y-8 h-full'>
                <h2 className='text-5xl font-bold leading-snug text-black'>
                    Buy and Sell Your Books 
                    <span className='text-blue-700'> for the Best Prices</span>
                </h2>
                <p className='md:w-4/5'>Discover a world of stories at your fingertips! Whether you're looking to find your next great read or share your beloved books with others, our platform makes it simple and rewarding. Join thousands of book lovers who trust us for quality books at unbeatable prices.</p>
                <div className='flex gap-3'>
                    <input 
                        type='search' 
                        name='search' 
                        id='search' 
                        placeholder='Search your book' 
                        className='py-2 px-4 rounded-lg outline-none w-full md:w-2/3 focus:ring-2 focus:ring-blue-500'
                    />
                    <button className='bg-blue-700 px-6 py-2 text-white font-medium hover:bg-black 
                    transition-all ease-in duration-200 rounded-lg'>Search</button>
                </div>
            </div>

            {/* Right Side */}
            <div>
                <BannerCard />
            </div>
        </div>
    </div>
  )
}

export default Banner