import React from 'react'
import { Link } from 'react-router-dom'
import { FaBook, FaCartShopping, FaHandshakeSimple, FaBookOpen } from 'react-icons/fa6'

const About = () => {
  const features = [
    {
      icon: <FaBook className="w-8 h-8 text-blue-600" />,
      title: "Extensive Collection",
      description: "Discover a vast library of books across multiple genres, from bestsellers to rare finds."
    },
    {
      icon: <FaCartShopping className="w-8 h-8 text-blue-600" />,
      title: "Easy Shopping",
      description: "Seamless shopping experience with secure payment options and quick checkout process."
    },
    {
      icon: <FaHandshakeSimple className="w-8 h-8 text-blue-600" />,
      title: "Sell Your Books",
      description: "Join our community of sellers and give your books a second life while earning."
    },
    {
      icon: <FaBookOpen className="w-8 h-8 text-blue-600" />,
      title: "Book Reviews",
      description: "Access detailed reviews and ratings from our community of book lovers."
    }
  ];

  return (
    <div className="py-16 px-4 lg:px-24 bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">About Bookish Bliss</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your premier destination for buying and selling books online. We're passionate about connecting readers with their next favorite book while providing a platform for sellers to share their literary treasures.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-blue-50 rounded-lg p-8 mb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          At Bookish Bliss, we believe that every book deserves to find its perfect reader. Our mission is to create a vibrant marketplace where book lovers can discover, buy, and sell books with ease. We're committed to promoting literacy, supporting independent sellers, and making quality books accessible to everyone.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Sets Us Apart</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
              <div className="mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Join Us Section */}
      <div className="text-center bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Whether you're a book enthusiast looking for your next read or a seller wanting to share your collection, Bookish Bliss is your perfect destination.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            to="/shop" 
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300"
          >
            Start Shopping
          </Link>
          <Link 
            to="/admin/dashboard" 
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-colors duration-300"
          >
            Become a Seller
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About