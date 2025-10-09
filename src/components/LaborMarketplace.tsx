import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, DollarSign, Briefcase } from 'lucide-react';
import { supabase, LaborListing } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookingModal } from './BookingModal';

interface LaborMarketplaceProps {
  onAuthClick: () => void;
}

export function LaborMarketplace({ onAuthClick }: LaborMarketplaceProps) {
  const [listings, setListings] = useState<LaborListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<LaborListing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<LaborListing | null>(null);
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
      .from('labor_listings')
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
          listing.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((listing) =>
        listing.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const handleBooking = (listing: LaborListing) => {
    if (!user) {
      onAuthClick();
      return;
    }

    if (profile?.user_type !== 'farmer') {
      alert('Only farmers can book labor workers');
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Find Labor Workers</h1>
          <p className="text-gray-600 text-lg">
            Connect with skilled daily wage laborers for your farming needs
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, skills..."
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
            <p className="mt-4 text-gray-600">Loading workers...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No labor workers found matching your criteria</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.title}</h3>
                      <p className="text-sm text-gray-600">{listing.profiles?.full_name}</p>
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
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{listing.experience_years} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>${listing.daily_rate}/day</span>
                    </div>
                  </div>

                  {listing.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {listing.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {listing.skills.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            +{listing.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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
          type="labor"
          onComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}
