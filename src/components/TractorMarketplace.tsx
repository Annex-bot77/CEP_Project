import { useState, useEffect } from 'react';
import { Search, MapPin, Tractor, Calendar, DollarSign, Gauge } from 'lucide-react';
import { supabase, TractorListing } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookingModal } from './BookingModal';

interface TractorMarketplaceProps {
  onAuthClick: () => void;
}

export function TractorMarketplace({ onAuthClick }: TractorMarketplaceProps) {
  const [listings, setListings] = useState<TractorListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<TractorListing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<TractorListing | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { user, profile } = useAuth();

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchTerm, locationFilter, listings]);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tractor_listings')
      .select('*, profiles(*)')
      .eq('availability_status', 'available')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setListings(data);
    }
    setLoading(false);
  };

  const filterListings = () => {
    let filtered = listings;

    if (searchTerm) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.tractor_model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((listing) =>
        listing.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const handleBooking = (listing: TractorListing) => {
    if (!user) {
      onAuthClick();
      return;
    }

    if (profile?.user_type !== 'farmer') {
      alert('Only farmers can rent tractors');
      return;
    }

    setSelectedListing(listing);
    setShowBookingModal(true);
  };

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    setSelectedListing(null);
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Rent Tractors</h1>
          <p className="text-gray-600 text-lg">
            Access farm machinery when you need it. Browse available tractors in your area.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by model, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading tractors...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No tractors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {listing.image_url ? (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <Tractor className="w-20 h-20 text-green-600" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.title}</h3>
                      <p className="text-sm text-gray-600">{listing.tractor_model}</p>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Available
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{listing.location}</span>
                    </div>
                    {listing.horsepower && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Gauge className="w-4 h-4 text-gray-400" />
                        <span>{listing.horsepower} HP</span>
                      </div>
                    )}
                    {listing.year && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Year {listing.year}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Hourly Rate</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${listing.hourly_rate}/hr
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Rate</span>
                      <span className="text-lg font-bold text-green-600">
                        ${listing.daily_rate}/day
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBooking(listing)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBookingModal && selectedListing && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          listing={selectedListing}
          type="tractor"
          onComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}
