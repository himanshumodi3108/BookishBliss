import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

//React icons
import { FaBarsStaggered, FaBlog, FaXmark } from 'react-icons/fa6';
import { AuthContext } from '../contexts/AuthProvider';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();

  const {user} = useContext(AuthContext);

  //Toggle Menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Handle navigation and scroll
  const handleNavClick = (path) => {
    if (path === '/' || (location.pathname === '/' && path === '/')) {
      scrollToTop();
    }
    setIsMenuOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      if(window.scrollY > 100){
        setIsSticky(true);
      }
      else{
        setIsSticky(false);
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    }
  }, [])

  //NavItems
  const navItems = [
    {link: "HOME", path: "/"},
    {link: "ABOUT", path: "/about"},
    {link: "SHOP", path: "/shop"},
    {link: "SELL YOUR BOOK", path: "/admin/dashboard"},
    {link: "BLOG", path: "/blog"},
  ]

  return (
    <header className='w-full bg-transparent fixed top-0 left-0 right-0 transition-all ease-in duration-300'>
      <nav className={`py-4 ${isSticky ? "sticky top-0 left-0 right-0 bg-blue-50 shadow-lg" : ""}`}>
        <div className='container mx-auto flex justify-between items-center text-base gap-8'>
          {/* Logo */}
          <Link to="/" onClick={() => handleNavClick('/')} className='text-2xl font-bold text-blue-700 flex items-center gap-2'>
            <FaBlog className='inline-block' />Bookish Bliss
          </Link>

          {/* Nav Items for large devices */}
          <ul className='md:flex space-x-12 hidden'>
            {
              navItems.map(({link, path}) => (
                <Link 
                  key={path} 
                  to={path} 
                  onClick={() => handleNavClick(path)}
                  className='block text-base text-gray-900 hover:text-blue-700 transition-colors duration-300'
                >
                  {link}
                </Link>
              ))
            }
          </ul>

          {/* Menu button for mobile devices */}
          <div className='md:hidden'>
            <button onClick={toggleMenu} className='text-gray-900 focus:outline-none'>
              {
                isMenuOpen ? <FaXmark className='h-5 w-5' /> : <FaBarsStaggered className='h-5 w-5' />
              }
            </button>
          </div>
        </div>

        {/* Nav Items for mobile devices */}
        <div className={`space-y-4 px-4 mt-16 py-7 bg-blue-700 ${isMenuOpen ? "block fixed top-0 right-0 left-0" : "hidden"}`}>
          {
            navItems.map(({link, path}) => (
              <Link 
                key={path} 
                to={path} 
                onClick={() => handleNavClick(path)}
                className='block text-base text-white hover:text-gray-200 transition-colors duration-300'
              >
                {link}
              </Link>
            ))
          }
        </div>
      </nav>
    </header>
  )
}

export default Navbar