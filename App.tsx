import { Topbar } from './components/Topbar';
import { Hero } from './components/Hero';
import { CountdownTimer } from './components/CountdownTimer';
import { Products } from './components/Products';
import { ReservationForm } from './components/ReservationForm';
import { HowItWorks } from './components/HowItWorks';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { Toaster } from "./components/ui/sonner";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Fixed Topbar */}
      <Topbar />
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />
        
        {/* Countdown Timer */}
        <div className="py-6 md:py-8">
          <CountdownTimer />
        </div>
        
        {/* Products Section */}
        <Products />
        
        {/* Reservation Form Section */}
        <ReservationForm />
        
        {/* How It Works Section */}
        <HowItWorks />
        
        {/* FAQ Section */}
        <FAQ />
        
        {/* Footer */}
        <Footer />
      </main>

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />


      {/* Toast Notifications */}
      <Toaster />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}