import { useState, useEffect } from 'react';
import { MapPin, DollarSign, Edit, Trash2, Briefcase, Gauge } from 'lucide-react';
import { supabase, LaborListing, TractorListing } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function MyListings() {
  const [laborListings, setLaborListings] = useState<LaborListing[]>([]);
  const [tractorListings, setTractorListings] = useState<TractorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    setLoading(true);

    if (profile?.user_type === 'laborer') {
      const { data } = await supabase
        .from('labor_listings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) setLaborListings(data);
    } else if (profile?.user_type === 'tractor_owner') {
      const { data } = await supabase
        .from('tractor_listings')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) setTractorListings(data);
    }

    setLoading(false);
  };

  const deleteLaborListing = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      await supabase.from('labor_listings').delete().eq('id', id);
      fetchListings();
    }
  };

  const deleteTractorListing = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      await supabase.from('tractor_listings').delete().eq('id', id);
      fetchListings();
    }
  };

  const toggleStatus = async (id: string, currentStatus: string, type: 'labor' | 'tractor') => {
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';

    if (type === 'labor') {
      await supabase
        .from('labor_listings')
        .update({ availability_status: newStatus })
        .eq('id', id);
    } else {
      await supabase
        .from('tractor_listings')
        .update({ availability_status: newStatus })
        .eq('id', id);
    }

    fetchListings();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading listings...</p>
      </div>
    );
  }

  const hasListings = laborListings.length > 0 || tractorListings.length > 0;

  if (!hasListings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">You don't have any listings yet</p>
        <p className="text-gray-500 text-sm">Click "Create Listing" to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {laborListings.map((listing) => (
        <div key={listing.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{listing.title}</h3>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    listing.availability_status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {listing.availability_status}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{listing.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-700">
                  <MapPin className="w-4 h-4" />
                  {listing.location}
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Briefcase className="w-4 h-4" />
                  {listing.experience_years} years
                </div>
                <div className="flex items-center gap-1 font-semibold text-green-600">
                  <DollarSign className="w-4 h-4" />
                  ${listing.daily_rate}/day
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(listing.id, listing.availability_status, 'labor')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Toggle Status
              </button>
              <button
                onClick={() => deleteLaborListing(listing.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          {listing.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.skills.map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {tractorListings.map((listing) => (
        <div key={listing.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{listing.title}</h3>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    listing.availability_status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {listing.availability_status}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{listing.description}</p>
              <p className="text-sm text-gray-700 mb-3">Model: {listing.tractor_model}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-700">
                  <MapPin className="w-4 h-4" />
                  {listing.location}
                </div>
                {listing.horsepower && (
                  <div className="flex items-center gap-1 text-gray-700">
                    <Gauge className="w-4 h-4" />
                    {listing.horsepower} HP
                  </div>
                )}
                <div className="flex items-center gap-1 font-semibold text-green-600">
                  <DollarSign className="w-4 h-4" />
                  ${listing.hourly_rate}/hr • ${listing.daily_rate}/day
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(listing.id, listing.availability_status, 'tractor')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Toggle Status
              </button>
              <button
                onClick={() => deleteTractorListing(listing.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
