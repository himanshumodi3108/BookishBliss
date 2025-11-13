import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartProvider';
import { AuthContext } from '../contexts/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Spinner } from 'flowbite-react';
import showToast from '../utils/toast';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      showToast.warning('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className='min-h-screen px-4 lg:px-24 py-12'>
        <h2 className='text-3xl font-bold mb-8'>Shopping Cart</h2>
        <div className='text-center py-12'>
          <p className='text-gray-600 text-xl mb-4'>Your cart is empty</p>
          <Link to="/shop" className='bg-blue-700 text-white px-6 py-2 rounded inline-block'>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className='min-h-screen px-4 lg:px-24 py-12'>
      <div className='flex justify-between items-center mb-8'>
        <h2 className='text-3xl font-bold'>Shopping Cart</h2>
        <Button onClick={clearCart} color="failure" size="sm">
          Clear Cart
        </Button>
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2 space-y-4'>
          {cartItems.map(item => (
            <Card key={item._id} className="flex flex-row gap-4">
              <img 
                src={item.imageURL} 
                alt={item.bookTitle} 
                className='w-24 h-32 object-cover rounded'
              />
              <div className='flex-1'>
                <h3 className='text-xl font-bold'>{item.bookTitle}</h3>
                <p className='text-gray-600'>by {item.authorName}</p>
                <p className='text-lg font-semibold mt-2'>₹{item.price}</p>
                
                <div className='flex items-center gap-4 mt-4'>
                  <div className='flex items-center gap-2'>
                    <Button 
                      size="xs" 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className='w-8 text-center'>{item.quantity}</span>
                    <Button 
                      size="xs" 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button 
                    color="failure" 
                    size="xs"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-xl font-bold'>₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className='lg:col-span-1'>
          <Card>
            <h3 className='text-2xl font-bold mb-4'>Order Summary</h3>
            <div className='space-y-2 mb-4'>
              <div className='flex justify-between'>
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <hr />
              <div className='flex justify-between text-xl font-bold'>
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <Button 
              className='w-full bg-blue-700' 
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
            <Link to="/shop" className='block text-center mt-4 text-blue-600 hover:underline'>
              Continue Shopping
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;

