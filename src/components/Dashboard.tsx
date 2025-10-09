import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MyListings } from './dashboard/MyListings';
import { MyBookings } from './dashboard/MyBookings';
import { CreateListingModal } from './dashboard/CreateListingModal';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings'>('listings');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { profile } = useAuth();

  const canCreateListing = profile?.user_type === 'laborer' || profile?.user_type === 'tractor_owner';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {profile?.full_name}!
            </p>
          </div>

          {canCreateListing && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'listings'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {canCreateListing ? 'My Listings' : 'Available Listings'}
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'bookings'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Bookings
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'listings' ? (
              <MyListings />
            ) : (
              <MyBookings />
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateListingModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
