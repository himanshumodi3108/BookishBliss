import { Outlet } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import MyFooter from './components/MyFooter';
import { Toaster } from 'sonner';

function App() {

  return (
    <>
      <Navbar />
      <div className='min-h-screen'>
      <Outlet />
      </div>
      <MyFooter />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
