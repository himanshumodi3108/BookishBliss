import React, { useContext, useState, useEffect } from 'react';
import { Sidebar } from "flowbite-react";
import { BiBuoy } from "react-icons/bi";
import { HiArrowSmRight, HiChartPie, HiInbox, HiOutlineCloudUpload, HiShoppingBag, HiTable, HiUser, HiViewBoards } from "react-icons/hi";
import Logo from "../assets/BookishBlissLogo.png";
import { AuthContext } from '../contexts/AuthProvider';
import apiClient from '../utils/api';
import { checkAdminStatus } from '../utils/checkAdmin';

const SideBar = () => {
  const {user} = useContext(AuthContext);
  const [isSeller, setIsSeller] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setIsSeller(false);
        setIsAdmin(false);
        setUserProfile(null);
        return;
      }

      try {
        // Fetch user profile
        try {
          const profile = await apiClient.get('/user/profile');
          setUserProfile(profile);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }

        // Check seller status
        const sellerStatus = await apiClient.get('/seller/status');
        setIsSeller(sellerStatus.isSeller || false);

        // Check admin status using the same function as AdminRoute
        const adminStatus = await checkAdminStatus(user);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking access:', error);
      }
    };

    checkAccess();
  }, [user]);

  // Get user avatar (photo or first letter)
  const getUserAvatar = () => {
    // Check for photoURL from profile or Firebase user
    const photoURL = userProfile?.photoURL || user?.photoURL;
    if (photoURL) {
      return (
        <img 
          src={photoURL} 
          alt={userProfile?.name || user?.displayName || 'User'} 
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
        />
      );
    }
    
    // Fallback to first letter of name or email
    const firstName = userProfile?.name || user?.displayName || user?.email || 'U';
    const firstLetter = firstName.charAt(0).toUpperCase();
    
    return (
      <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-2xl border-2 border-blue-700">
        {firstLetter}
      </div>
    );
  };

  return (
    <Sidebar aria-label="Sidebar with content separator example">
      <Sidebar.Logo href="/" img={Logo} imgAlt="Bookish Bliss logo">
        Bookish Bliss
      </Sidebar.Logo>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item href="/admin/dashboard" icon={HiChartPie}>
            Dashboard
          </Sidebar.Item>
          {/* Show upload/manage only to admins or sellers */}
          {(isAdmin || isSeller) && (
            <>
              <Sidebar.Item href="/admin/dashboard/upload" icon={HiOutlineCloudUpload}>
                Upload Book
              </Sidebar.Item>
              <Sidebar.Item href="/admin/dashboard/manage" icon={HiInbox}>
                {isSeller && !isAdmin ? 'My Books' : 'Manage Books'}
              </Sidebar.Item>
            </>
          )}
          {/* Show seller requests only to admins */}
          {isAdmin && (
            <Sidebar.Item href="/admin/dashboard/seller-requests" icon={HiShoppingBag}>
              Seller Requests
            </Sidebar.Item>
          )}
          {/* Show users only to admins */}
          {isAdmin && (
            <Sidebar.Item href="#" icon={HiUser}>
              Users
            </Sidebar.Item>
          )}
          <Sidebar.Item href="/logout" icon={HiTable}>
            Log Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
        <Sidebar.ItemGroup>
          <Sidebar.Item href="#" icon={HiChartPie}>
            Upgrade to Pro
          </Sidebar.Item>
          <Sidebar.Item href="#" icon={HiViewBoards}>
            Documentation
          </Sidebar.Item>
          <Sidebar.Item href="#" icon={BiBuoy}>
            Help
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
      {user && (
        <div className='px-4 py-5 border-t border-gray-200'>
          <div className='flex items-center gap-3'>
            {getUserAvatar()}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {userProfile?.name || user?.displayName || 'User'}
              </p>
              <p className='text-xs text-gray-500 truncate'>
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  )
}

export default SideBar