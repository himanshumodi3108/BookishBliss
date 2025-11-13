import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

//React icons
import { FaBarsStaggered, FaBlog, FaXmark } from 'react-icons/fa6';
import { FaShoppingCart } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthProvider';
import { CartContext } from '../contexts/CartProvider';
import showToast from '../utils/toast';
import apiClient from '../utils/api';
import { checkAdminStatus } from '../utils/checkAdmin';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  const {user, logOut} = useContext(AuthContext);
  const { getCartItemsCount } = useContext(CartContext);
  const cartItemsCount = getCartItemsCount();

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

  // Handle logout button click - show modal
  const handleLogoutClick = (e) => {
    e.preventDefault();
    setIsLogoutModalOpen(true);
    setIsProfileDropdownOpen(false);
  }

  // Handle logout confirmation
  const handleLogoutConfirm = async () => {
    try {
      await logOut();
      showToast.success('Logged out successfully');
      setIsMenuOpen(false);
      setIsLogoutModalOpen(false);
    } catch (error) {
      showToast.error('Failed to logout');
    }
  }

  // Handle logout cancel
  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  }

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await apiClient.get('/user/profile');
          setUserProfile(profile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
    };
    fetchUserProfile();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Get user avatar (photo or first letter)
  const getUserAvatar = () => {
    // Check for photoURL from profile or Firebase user
    const photoURL = userProfile?.photoURL || user?.photoURL;
    if (photoURL) {
      return (
        <img 
          src={photoURL} 
          alt={userProfile?.name || user?.displayName || 'User'} 
          className="w-10 h-10 rounded-full object-cover border-2 border-blue-600"
        />
      );
    }
    
    // Fallback to first letter of name or email
    const firstName = userProfile?.name || user?.displayName || user?.email || 'U';
    const firstLetter = firstName.charAt(0).toUpperCase();
    
    return (
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg border-2 border-blue-700">
        {firstLetter}
      </div>
    );
  };

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
    {link: "SELL YOUR BOOK", path: "/seller-request-form", isSpecial: true}, // Special handling for seller link
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
          <ul className='md:flex space-x-12 hidden items-center'>
            {
              navItems.map(({link, path, isSpecial}) => {
                if (isSpecial && link === "SELL YOUR BOOK") {
                  // Special handling for "Sell Your Book" - check seller status
                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        handleNavClick(path);
                        // Check admin status first - admins go to admin dashboard
                        try {
                          const isAdmin = await checkAdminStatus(user);
                          if (isAdmin) {
                            navigate('/admin/dashboard');
                            return;
                          }
                          // Check seller status before redirecting
                          const sellerStatus = await apiClient.get('/seller/status');
                          if (sellerStatus.isSeller) {
                            navigate('/seller/dashboard');
                          } else {
                            navigate('/seller-request-form');
                          }
                        } catch (error) {
                          // If check fails, redirect to request form
                          navigate('/seller-request-form');
                        }
                      }}
                      className='block text-base text-gray-900 hover:text-blue-700 transition-colors duration-300'
                    >
                      {link}
                    </button>
                  );
                }
                return (
                  <Link 
                    key={path} 
                    to={path} 
                    onClick={() => handleNavClick(path)}
                    className='block text-base text-gray-900 hover:text-blue-700 transition-colors duration-300'
                  >
                    {link}
                  </Link>
                );
              })
            }
            <Link 
              to="/cart" 
              onClick={() => handleNavClick('/cart')}
              className='relative text-base text-gray-900 hover:text-blue-700 transition-colors duration-300'
            >
              <FaShoppingCart className='h-5 w-5' />
              {cartItemsCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                  {cartItemsCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {getUserAvatar()}
                </button>
                
                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/profile"
                      onClick={() => {
                        handleNavClick('/profile');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => {
                        handleNavClick('/wishlist');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => {
                        handleNavClick('/orders');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      Orders
                    </Link>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        setIsProfileDropdownOpen(false);
                        setTimeout(async () => {
                          // Check admin status first - admins go to admin dashboard
                          try {
                            const isAdmin = await checkAdminStatus(user);
                            if (isAdmin) {
                              navigate('/admin/dashboard');
                              return;
                            }
                            // Check seller status before redirecting
                            const sellerStatus = await apiClient.get('/seller/status');
                            if (sellerStatus.isSeller) {
                              navigate('/seller/dashboard');
                            } else {
                              navigate('/seller-request-form');
                            }
                          } catch (error) {
                            // If check fails, redirect to request form
                            navigate('/seller-request-form');
                          }
                        }, 0);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      Sell Your Book
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileDropdownOpen(false);
                        setTimeout(() => {
                          navigate('/seller-requests');
                        }, 0);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      My Requests
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileDropdownOpen(false);
                        setTimeout(() => {
                          navigate('/seller/dashboard');
                        }, 0);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      Seller Dashboard
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogoutClick}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => handleNavClick('/login')}
                className='block text-base text-gray-900 hover:text-blue-700 transition-colors duration-300'
              >
                Login
              </Link>
            )}
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
        <div className={`space-y-4 px-4 mt-16 py-7 bg-blue-700 ${isMenuOpen ? "block fixed top-0 right-0 left-0 z-50" : "hidden"}`}>
          {
            navItems.map(({link, path, isSpecial}) => {
              if (isSpecial && link === "SELL YOUR BOOK") {
                // Special handling for "Sell Your Book" - check seller status
                return (
                  <button
                    key={path}
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      handleNavClick(path);
                      setIsMenuOpen(false);
                      // Check admin status first - admins go to admin dashboard
                      try {
                        const isAdmin = await checkAdminStatus(user);
                        if (isAdmin) {
                          navigate('/admin/dashboard');
                          return;
                        }
                        // Check seller status before redirecting
                        const sellerStatus = await apiClient.get('/seller/status');
                        if (sellerStatus.isSeller) {
                          navigate('/seller/dashboard');
                        } else {
                          navigate('/seller-request-form');
                        }
                      } catch (error) {
                        // If check fails, redirect to request form
                        navigate('/seller-request-form');
                      }
                    }}
                    className='block text-base text-white hover:text-gray-200 transition-colors duration-300 w-full text-left'
                  >
                    {link}
                  </button>
                );
              }
              return (
                <Link 
                  key={path} 
                  to={path} 
                  onClick={() => handleNavClick(path)}
                  className='block text-base text-white hover:text-gray-200 transition-colors duration-300'
                >
                  {link}
                </Link>
              );
            })
          }
          <Link 
            to="/cart" 
            onClick={() => handleNavClick('/cart')}
            className='relative block text-base text-white hover:text-gray-200 transition-colors duration-300'
          >
            <div className='flex items-center gap-2'>
              <FaShoppingCart className='h-5 w-5' />
              <span>Cart</span>
              {cartItemsCount > 0 && (
                <span className='bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                  {cartItemsCount}
                </span>
              )}
            </div>
          </Link>
          {user ? (
            <>
              <Link 
                to="/profile" 
                onClick={() => handleNavClick('/profile')}
                className='block text-base text-white hover:text-gray-200 transition-colors duration-300'
              >
                Profile
              </Link>
              <Link 
                to="/wishlist" 
                onClick={() => handleNavClick('/wishlist')}
                className='block text-base text-white hover:text-gray-200 transition-colors duration-300'
              >
                Wishlist
              </Link>
              <Link 
                to="/orders" 
                onClick={() => handleNavClick('/orders')}
                className='block text-base text-white hover:text-gray-200 transition-colors duration-300'
              >
                Orders
              </Link>
              <button 
                type="button"
                onClick={async () => {
                  setIsMenuOpen(false);
                  // Check admin status first - admins go to admin dashboard
                  try {
                    const isAdmin = await checkAdminStatus(user);
                    if (isAdmin) {
                      navigate('/admin/dashboard');
                      return;
                    }
                    // Check seller status before redirecting
                    const sellerStatus = await apiClient.get('/seller/status');
                    if (sellerStatus.isSeller) {
                      navigate('/seller/dashboard');
                    } else {
                      navigate('/seller-request-form');
                    }
                  } catch (error) {
                    // If check fails, redirect to request form
                    navigate('/seller-request-form');
                  }
                }}
                className='block text-base text-white hover:text-gray-200 transition-colors duration-300 w-full text-left'
              >
                Sell Your Book
              </button>
              <button 
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/seller-requests');
                }}
                className='block text-base text-white hover:text-gray-200 transition-colors duration-300 w-full text-left'
              >
                My Requests
              </button>
              <button 
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/seller/dashboard');
                }}
                className='block text-base text-white hover:text-gray-200 transition-colors duration-300 w-full text-left'
              >
                Seller Dashboard
              </button>
              <button 
                onClick={handleLogoutClick}
                className='block text-base text-white hover:text-gray-200 transition-colors duration-300 w-full text-left'
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              onClick={() => handleNavClick('/login')}
              className='block text-base text-white hover:text-gray-200 transition-colors duration-300'
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleLogoutCancel}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-[101]">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar