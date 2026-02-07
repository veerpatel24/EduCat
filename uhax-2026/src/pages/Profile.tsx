import { useState } from 'react';
import { Award, TrendingUp, LogOut, Settings, Save, Flame, Cat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateEmail, updatePassword } from 'firebase/auth';
import { db, useLiveQuery } from '../services/db';

const Profile = () => {
  const { user, logout } = useAuth();
  const stats = useLiveQuery(() => db.stats.get());
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
                <p className="text-2xl font-bold text-yellow-500">{stats?.coins || 0}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center justify-center gap-1">
                  <Award className="w-3 h-3" /> Coins
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">{stats?.unlockedMonsters.length || 0}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center justify-center gap-1">
                  <Cat className="w-3 h-3" /> Monsters
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{stats?.streak || 0}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" /> Streak
                </p>
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
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm">
                {message}
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={user?.email || ''}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Update Profile
              </button>
            </form>
          </div>
        </div>

        {/* Recent Activity / Stats (Could be expanded later) */}
        <div className="flex-1 space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {/* Placeholder for activity log */}
              <p className="text-gray-500 italic text-center py-8">No recent activity recorded.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
