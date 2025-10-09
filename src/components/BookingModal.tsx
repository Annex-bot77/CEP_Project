import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { supabase, LaborListing, TractorListing } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: LaborListing | TractorListing;
  type: 'labor' | 'tractor';
  onComplete: () => void;
}

export function BookingModal({ isOpen, onClose, listing, type, onComplete }: BookingModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();

  if (!isOpen) return null;

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (type === 'labor') {
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return days * (listing as LaborListing).daily_rate;
    } else {
      const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      return hours * (listing as TractorListing).hourly_rate;
    }
  };

  const getDuration = () => {
    if (!startDate || !endDate) return '';

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (type === 'labor') {
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return `${days} day${days > 1 ? 's' : ''}`;
    } else {
      const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in to book');
      setLoading(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      if (type === 'labor') {
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const totalAmount = days * (listing as LaborListing).daily_rate;

        const { error: bookingError } = await supabase.from('labor_bookings').insert({
          labor_listing_id: listing.id,
          farmer_id: user.id,
          laborer_id: (listing as LaborListing).user_id,
          start_date: startDate,
          end_date: endDate,
          total_days: days,
          total_amount: totalAmount,
          notes: notes || null,
        });

        if (bookingError) throw bookingError;
      } else {
        const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        const totalAmount = hours * (listing as TractorListing).hourly_rate;

        const { error: bookingError } = await supabase.from('tractor_bookings').insert({
          tractor_listing_id: listing.id,
          farmer_id: user.id,
          owner_id: (listing as TractorListing).owner_id,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          total_hours: hours,
          total_amount: totalAmount,
          notes: notes || null,
        });

        if (bookingError) throw bookingError;
      }

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Book {type === 'labor' ? 'Worker' : 'Tractor'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              {type === 'labor' ? (listing as LaborListing).title : (listing as TractorListing).title}
            </h3>
            <p className="text-sm text-gray-600">
              {type === 'labor'
                ? `$${(listing as LaborListing).daily_rate}/day`
                : `$${(listing as TractorListing).hourly_rate}/hour`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start {type === 'labor' ? 'Date' : 'Date & Time'}
              </label>
              <input
                type={type === 'labor' ? 'date' : 'datetime-local'}
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End {type === 'labor' ? 'Date' : 'Date & Time'}
              </label>
              <input
                type={type === 'labor' ? 'date' : 'datetime-local'}
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any special requirements or notes..."
              />
            </div>

            {startDate && endDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700">Duration</span>
                  <span className="font-semibold text-gray-900">{getDuration()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Total Amount</span>
                  <span className="text-xl font-bold text-green-600">${calculateTotal()}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !startDate || !endDate}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              {loading ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
