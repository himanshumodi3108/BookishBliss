import React, { useState, useContext } from 'react';
import { CartContext } from '../contexts/CartProvider';
import { AuthContext } from '../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button, Card, TextInput, Label, Textarea, Spinner } from 'flowbite-react';
import apiClient from '../utils/api';
import showToast from '../utils/toast';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showToast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      showToast.error('Please fill in all shipping details');
      return;
    }

    try {
      setLoading(true);
      const totalAmount = getCartTotal();
      
      const orderData = {
        items: cartItems.map(item => ({
          bookId: item._id,
          bookTitle: item.bookTitle,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        totalAmount
      };

      const response = await apiClient.post('/orders', orderData);

      if (response.paymentParams && response.paymentUrl) {
        // Paytm payment - create form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.paymentUrl;
        
        Object.keys(response.paymentParams).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = response.paymentParams[key];
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        // Direct payment (Paytm disabled)
        showToast.success(response.message || 'Order placed successfully!');
        clearCart();
        navigate(`/orders/${response.orderId}`);
      }
    } catch (error) {
      showToast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className='min-h-screen px-4 lg:px-24 py-12'>
        <div className='text-center py-12'>
          <p className='text-gray-600 text-xl mb-4'>Your cart is empty</p>
          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className='min-h-screen px-4 lg:px-24 py-12'>
      <h2 className='text-3xl font-bold mb-8'>Checkout</h2>
      
      <div className='grid lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <Card>
            <h3 className='text-2xl font-bold mb-4'>Shipping Address</h3>
            <form onSubmit={handlePlaceOrder} className='space-y-4'>
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <TextInput
                  id="name"
                  name="name"
                  value={shippingAddress.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <TextInput
                  id="phone"
                  name="phone"
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                />
              </div>
              
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <TextInput
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">State *</Label>
                  <TextInput
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <TextInput
                  id="pincode"
                  name="pincode"
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className='w-full bg-blue-700' 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </form>
          </Card>
        </div>

        <div className='lg:col-span-1'>
          <Card>
            <h3 className='text-2xl font-bold mb-4'>Order Summary</h3>
            <div className='space-y-2 mb-4'>
              {cartItems.map(item => (
                <div key={item._id} className='flex justify-between text-sm'>
                  <span>{item.bookTitle} x{item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className='flex justify-between text-xl font-bold'>
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;



