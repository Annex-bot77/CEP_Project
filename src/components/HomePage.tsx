import { Users, Tractor, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onAuthClick: () => void;
}

export function HomePage({ onNavigate, onAuthClick }: HomePageProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Digitalizing Farm Labor and
            <span className="text-green-600"> Tractor Availability</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connecting farmers, daily wage laborers, and tractor owners to improve access to
            essential agricultural resources. Supporting organic and smallholder farmers across the region.
          </p>
          {!user && (
            <button
              onClick={onAuthClick}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg shadow-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-16">
          <div
            onClick={() => user ? onNavigate('labor') : onAuthClick()}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Find Labor</h2>
            <p className="text-gray-600 mb-6">
              Connect with skilled daily wage laborers ready to help with your farming needs.
              Browse profiles, check availability, and book workers instantly.
            </p>
            <button className="inline-flex items-center gap-2 text-green-600 font-medium hover:gap-3 transition-all">
              Browse Workers
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div
            onClick={() => user ? onNavigate('tractors') : onAuthClick()}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Tractor className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Rent Tractors</h2>
            <p className="text-gray-600 mb-6">
              Access farm machinery when you need it. Browse available tractors, check rates,
              and book equipment by the hour or day.
            </p>
            <button className="inline-flex items-center gap-2 text-green-600 font-medium hover:gap-3 transition-all">
              View Tractors
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Why Choose Farm Connect?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Users</h3>
              <p className="text-gray-600">
                All laborers and tractor owners are verified to ensure quality and reliability
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and quick booking process with instant confirmation and tracking
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Pricing</h3>
              <p className="text-gray-600">
                Transparent pricing with no hidden fees. Pay competitive rates for quality service
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Network</h3>
              <p className="text-gray-600">
                Connect with workers and equipment owners in your area for faster response
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Get help whenever you need it with our dedicated customer support team
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                Your data and transactions are protected with industry-standard security
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Join Our Growing Community
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-green-50">
            Whether you're a farmer seeking help, a laborer looking for work, or a tractor owner
            wanting to maximize your equipment's usage, we're here to help.
          </p>
          {!user && (
            <button
              onClick={onAuthClick}
              className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium text-lg shadow-lg"
            >
              Sign Up Today
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
