import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Brain, User, Clock, PlusSquare, Ghost } from 'lucide-react';

const Sidebar = () => {
  const mainNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pending-assignments', icon: Clock, label: 'Assignments' },
    { to: '/tutor', icon: GraduationCap, label: 'AI Tutor' },
    { to: '/study', icon: Brain, label: 'Pomodoro Clock' },
    { to: '/monsters', icon: Ghost, label: 'Monsters' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800">
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/30 overflow-hidden">
          <div 
            className="w-8 h-8"
            style={{
              backgroundImage: 'url(/Kittycat.exe/pipo-nekonin001.png)',
              backgroundSize: '300% 400%',
              backgroundPosition: '50% 0%',
              imageRendering: 'pixelated'
            }}
          />
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
          EduCat
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 flex flex-col">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600 shadow-lg shadow-blue-900/20 text-white'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        <div className="flex-1" />

        <NavLink
          to="/create-assignment"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-auto ${
              isActive
                ? 'bg-blue-600 shadow-lg shadow-blue-900/20 text-white'
                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <PlusSquare className="w-5 h-5" />
          <span className="font-medium">Create Assignment</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
