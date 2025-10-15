import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateListingModal({ isOpen, onClose }: CreateListingModalProps) {
  const { user, profile } = useAuth();
  const isLaborer = profile?.user_type === 'laborer';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [skills, setSkills] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  const [tractorModel, setTractorModel] = useState('');
  const [horsepower, setHorsepower] = useState('');
  const [year, setYear] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [tractorDailyRate, setTractorDailyRate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLaborer) {
        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);

        const { error: insertError } = await supabase.from('labor_listings').insert({
          user_id: user?.id,
          title,
          description,
          skills: skillsArray,
          daily_rate: parseFloat(dailyRate),
          experience_years: parseInt(experienceYears) || 0,
          location,
        });

        if (insertError) throw insertError;
      } else {
        if (!profile?.rc_number) {
          setError('RC Number is required to create tractor listings. Please update your profile with your RC Number.');
          setLoading(false);
          return;
        }

        const { error: insertError } = await supabase.from('tractor_listings').insert({
          owner_id: user?.id,
          title,
          description,
          tractor_model: tractorModel,
          horsepower: horsepower ? parseInt(horsepower) : null,
          year: year ? parseInt(year) : null,
          hourly_rate: parseFloat(hourlyRate),
          daily_rate: parseFloat(tractorDailyRate),
          location,
        });

        if (insertError) throw insertError;
      }

      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Create {isLaborer ? 'Labor' : 'Tractor'} Listing
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={isLaborer ? 'e.g., Experienced Farm Worker' : 'e.g., John Deere 5075E'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Provide detailed information about your offering..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Springfield County"
              />
            </div>

            {isLaborer ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Planting, Harvesting, Irrigation"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Rate ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tractor Model/Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={tractorModel}
                    onChange={(e) => setTractorModel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., John Deere 5075E"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horsepower (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={horsepower}
                      onChange={(e) => setHorsepower(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year (Optional)
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Rate ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={tractorDailyRate}
                      onChange={(e) => setTractorDailyRate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
