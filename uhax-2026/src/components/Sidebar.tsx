import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Brain, User, Clock, PlusSquare, Ghost } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/create-assignment', icon: PlusSquare, label: 'Create Assignment' },
    { to: '/pending-assignments', icon: Clock, label: 'Assignments' },
    { to: '/monsters', icon: Ghost, label: 'Monsters' },
    { to: '/tutor', icon: GraduationCap, label: 'AI Tutor' },
    { to: '/study', icon: Brain, label: 'Study Companion' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          EduFlow AI
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
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
      </nav>
    </aside>
  );
};

export default Sidebar;
