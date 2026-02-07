import { useState } from 'react';
import { Award, TrendingUp, LogOut, Settings, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateEmail, updatePassword } from 'firebase/auth';

const Profile = () => {
  const { user, logout } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');
    setError('');

    const promises = [];
    if (newEmail && newEmail !== user.email) {
      promises.push(updateEmail(user, newEmail));
    }
    if (newPassword) {
      promises.push(updatePassword(user, newPassword));
    }

    try {
      await Promise.all(promises);
      setMessage('Profile updated successfully');
      setNewPassword('');
    } catch (err) {
      setError('Failed to update profile. You may need to sign in again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your achievements and manage account.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        {/* User Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 mx-auto mb-4 p-1">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-3xl">
                🎓
              </div>
            </div>
            <h2 className="text-xl font-bold">{user?.email?.split('@')[0] || 'Student'}</h2>
            <p className="text-gray-500">{user?.email}</p>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold">1,250</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Points</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Badges</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Streak</p>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Account Settings
            </h3>
            
            {message && (
              <div className="bg-green-500/10 text-green-500 p-3 rounded-lg text-sm mb-4">
                {message}
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Update Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder={user?.email || 'email@example.com'}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Leave blank to keep same"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* Badges & Stats */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Recent Badges
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="aspect-square bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center p-2 text-center border border-gray-200 dark:border-gray-700">
                   <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center text-yellow-600 mb-2">
                     <Award className="w-5 h-5" />
                   </div>
                   <span className="text-xs font-medium">Math Whiz</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Learning Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Mathematics</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Computer Science</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Physics</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
