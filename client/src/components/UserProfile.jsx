import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import { Button, Card, TextInput, Label, Spinner } from 'flowbite-react';
import apiClient from '../utils/api';
import showToast from '../utils/toast';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get('/user/profile');
        setProfile({
          name: data.name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          address: data.address || {
            street: '',
            city: '',
            state: '',
            pincode: ''
          }
        });
      } catch (error) {
        showToast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfile({
        ...profile,
        address: {
          ...profile.address,
          [addressField]: value
        }
      });
    } else {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiClient.patch('/user/profile', profile);
      showToast.success('Profile updated successfully!');
    } catch (error) {
      showToast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen px-4 lg:px-24 py-12 flex justify-center items-center'>
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className='min-h-screen px-4 lg:px-24 py-12'>
      <h2 className='text-3xl font-bold mb-8'>My Profile</h2>
      
      <Card className='max-w-2xl'>
        <form onSubmit={handleSave} className='space-y-4'>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <TextInput
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              value={profile.email}
              disabled
              className='bg-gray-100'
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <TextInput
              id="phone"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <Label htmlFor="address.street">Street Address</Label>
            <TextInput
              id="address.street"
              name="address.street"
              value={profile.address.street}
              onChange={handleInputChange}
            />
          </div>
          
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor="address.city">City</Label>
              <TextInput
                id="address.city"
                name="address.city"
                value={profile.address.city}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="address.state">State</Label>
              <TextInput
                id="address.state"
                name="address.state"
                value={profile.address.state}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address.pincode">Pincode</Label>
            <TextInput
              id="address.pincode"
              name="address.pincode"
              value={profile.address.pincode}
              onChange={handleInputChange}
            />
          </div>
          
          <Button 
            type="submit" 
            className='bg-blue-700' 
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default UserProfile;



