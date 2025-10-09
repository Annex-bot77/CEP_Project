import { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface BookingWithDetails {
  id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  listing_title: string;
  listing_location: string;
  other_party_name: string;
  type: 'labor' | 'tractor';
  role: 'requester' | 'provider';
  duration: string;
}

export function MyBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    const allBookings: BookingWithDetails[] = [];

    if (profile?.user_type === 'farmer') {
      const { data: laborBookings } = await supabase
        .from('labor_bookings')
        .select(`
          *,
          labor_listings(title, location),
          laborer:profiles!labor_bookings_laborer_id_fkey(full_name)
        `)
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false });

      if (laborBookings) {
        laborBookings.forEach((booking: any) => {
          allBookings.push({
            id: booking.id,
            start_date: booking.start_date,
            end_date: booking.end_date,
            total_amount: booking.total_amount,
            status: booking.status,
            notes: booking.notes,
            created_at: booking.created_at,
            listing_title: booking.labor_listings?.title || 'N/A',
            listing_location: booking.labor_listings?.location || 'N/A',
            other_party_name: booking.laborer?.full_name || 'N/A',
            type: 'labor',
            role: 'requester',
            duration: `${booking.total_days} days`,
          });
        });
      }

      const { data: tractorBookings } = await supabase
        .from('tractor_bookings')
        .select(`
          *,
          tractor_listings(title, location),
          owner:profiles!tractor_bookings_owner_id_fkey(full_name)
        `)
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false });

      if (tractorBookings) {
        tractorBookings.forEach((booking: any) => {
          allBookings.push({
            id: booking.id,
            start_date: booking.start_date,
            end_date: booking.end_date,
            total_amount: booking.total_amount,
            status: booking.status,
            notes: booking.notes,
            created_at: booking.created_at,
            listing_title: booking.tractor_listings?.title || 'N/A',
            listing_location: booking.tractor_listings?.location || 'N/A',
            other_party_name: booking.owner?.full_name || 'N/A',
            type: 'tractor',
            role: 'requester',
            duration: `${booking.total_hours} hours`,
          });
        });
      }
    }

    if (profile?.user_type === 'laborer') {
      const { data: laborBookings } = await supabase
        .from('labor_bookings')
        .select(`
          *,
          labor_listings(title, location),
          farmer:profiles!labor_bookings_farmer_id_fkey(full_name)
        `)
        .eq('laborer_id', user?.id)
        .order('created_at', { ascending: false });

      if (laborBookings) {
        laborBookings.forEach((booking: any) => {
          allBookings.push({
            id: booking.id,
            start_date: booking.start_date,
            end_date: booking.end_date,
            total_amount: booking.total_amount,
            status: booking.status,
            notes: booking.notes,
            created_at: booking.created_at,
            listing_title: booking.labor_listings?.title || 'N/A',
            listing_location: booking.labor_listings?.location || 'N/A',
            other_party_name: booking.farmer?.full_name || 'N/A',
            type: 'labor',
            role: 'provider',
            duration: `${booking.total_days} days`,
          });
        });
      }
    }

    if (profile?.user_type === 'tractor_owner') {
      const { data: tractorBookings } = await supabase
        .from('tractor_bookings')
        .select(`
          *,
          tractor_listings(title, location),
          farmer:profiles!tractor_bookings_farmer_id_fkey(full_name)
        `)
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (tractorBookings) {
        tractorBookings.forEach((booking: any) => {
          allBookings.push({
            id: booking.id,
            start_date: booking.start_date,
            end_date: booking.end_date,
            total_amount: booking.total_amount,
            status: booking.status,
            notes: booking.notes,
            created_at: booking.created_at,
            listing_title: booking.tractor_listings?.title || 'N/A',
            listing_location: booking.tractor_listings?.location || 'N/A',
            other_party_name: booking.farmer?.full_name || 'N/A',
            type: 'tractor',
            role: 'provider',
            duration: `${booking.total_hours} hours`,
          });
        });
      }
    }

    allBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setBookings(allBookings);
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, type: 'labor' | 'tractor', newStatus: string) => {
    const table = type === 'labor' ? 'labor_bookings' : 'tractor_bookings';
    await supabase.from(table).update({ status: newStatus }).eq('id', bookingId);
    fetchBookings();
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{booking.listing_title}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {booking.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4" />
                      <span>{booking.role === 'requester' ? 'Provider' : 'Farmer'}: {booking.other_party_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.listing_location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>{booking.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span>${booking.total_amount}</span>
                    </div>
                    {booking.notes && (
                      <div className="mt-2 p-3 bg-gray-50 rounded text-gray-700">
                        <p className="text-xs font-semibold mb-1">Notes:</p>
                        <p>{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                {booking.role === 'provider' && booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateBookingStatus(booking.id, booking.type, 'confirmed')}
                      className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, booking.type, 'cancelled')}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                )}
                {booking.role === 'requester' && booking.status === 'confirmed' && (
                  <button
                    onClick={() => updateBookingStatus(booking.id, booking.type, 'completed')}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
