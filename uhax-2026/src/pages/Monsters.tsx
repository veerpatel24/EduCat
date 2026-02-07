import { useState, useEffect } from 'react';
import { db, useLiveQuery } from '../services/db';
import { Lock, Unlock, Play, Pause } from 'lucide-react';

const MONSTER_COUNT = 32;
const MONSTER_COST = 100;

// Helper component for sprite animation
const SpriteAnimator = ({ src, className }: { src: string, className?: string }) => {
  const [frame, setFrame] = useState(0);
  const [direction, setDirection] = useState(0); // 0: Down, 1: Left, 2: Right, 3: Up

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 3);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Optional: Cycle directions slowly to show full sprite sheet
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection((prev) => (prev + 1) % 4);
    }, 2000); // Change direction every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={className}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: '300% 400%',
        backgroundPosition: `${frame * 50}% ${direction * 33.33}%`,
        imageRendering: 'pixelated'
      }}
    />
  );
};

const Monsters = () => {
  const stats = useLiveQuery(() => db.stats.get());
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);

  const monsters = Array.from({ length: MONSTER_COUNT }, (_, i) => {
    const id = (i + 1).toString().padStart(3, '0');
    return {
      id: `monster-${id}`,
      filename: `pipo-nekonin${id}.png`,
      name: `Monster #${i + 1}`
    };
  });

  // Set default selected monster to the first unlocked one if not set
  useEffect(() => {
    if (stats && !selectedMonsterId && stats.unlockedMonsters.length > 0) {
      setSelectedMonsterId(stats.unlockedMonsters[0]);
    }
  }, [stats, selectedMonsterId]);

  const handleUnlock = async (monsterId: string) => {
    if (!stats || stats.coins < MONSTER_COST) return;
    
    setUnlocking(monsterId);
    try {
      await db.stats.unlockMonster(monsterId, MONSTER_COST);
      // Auto-select the newly unlocked monster
      setSelectedMonsterId(monsterId);
    } catch (error) {
      console.error("Failed to unlock monster:", error);
    } finally {
      setUnlocking(null);
    }
  };

  if (!stats) return <div className="text-white p-8">Loading...</div>;

  const selectedMonster = monsters.find(m => m.id === selectedMonsterId);

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Monster Collection</h1>
          <p className="text-gray-400">Collect and evolve your pixel companions!</p>
        </div>
        <div className="flex items-center gap-3 bg-yellow-500/20 px-6 py-3 rounded-xl border border-yellow-500/30">
          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-yellow-900 font-bold">
            $
          </div>
          <span className="text-2xl font-bold text-yellow-400">{stats.coins} Coins</span>
        </div>
      </header>

      {/* Featured / Animated Showcase */}
      {selectedMonster && (
        <section className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative z-10 text-center space-y-4">
            <h2 className="text-xl font-medium text-blue-200 uppercase tracking-widest">Active Companion</h2>
            
            <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-full border-4 border-blue-500/50 shadow-2xl shadow-blue-500/20">
              <SpriteAnimator 
                src={`/Kittycat.exe/${selectedMonster.filename}`} 
                className="w-32 h-32"
              />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedMonster.name}</h3>
              <p className="text-blue-300 text-sm">Level 1 • Pixel Spirit</p>
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {monsters.map((monster) => {
          const isUnlocked = stats.unlockedMonsters.includes(monster.id);
          const canAfford = stats.coins >= MONSTER_COST;
          const isSelected = selectedMonsterId === monster.id;

          return (
            <div 
              key={monster.id}
              onClick={() => isUnlocked && setSelectedMonsterId(monster.id)}
              className={`
                relative group rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer
                ${isSelected
                  ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500'
                  : isUnlocked 
                    ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10' 
                    : 'bg-gray-900 border-gray-800 opacity-75 hover:opacity-100'
                }
              `}
            >
              <div className="aspect-square p-6 flex items-center justify-center bg-gradient-to-br from-gray-800/50 to-transparent">
                {/* Static Preview (Show full sheet or just first frame? Full sheet is messy, let's show a crop) */}
                <div 
                  className="w-16 h-16"
                  style={{
                    backgroundImage: `url(/Kittycat.exe/${monster.filename})`,
                    backgroundSize: '300% 400%',
                    backgroundPosition: '50% 0%', // Center frame, Down direction
                    imageRendering: 'pixelated',
                    filter: isUnlocked ? 'none' : 'brightness-0 invert(1) opacity(0.3)'
                  }}
                />
              </div>

              <div className="p-4 border-t border-gray-700/50">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-green-400">
                    <span className="font-medium text-sm">{isSelected ? 'Selected' : 'Unlocked'}</span>
                    <Unlock className="w-4 h-4" />
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlock(monster.id);
                    }}
                    disabled={!canAfford || unlocking === monster.id}
                    className={`
                      w-full py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm
                      ${canAfford 
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-900/20' 
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {unlocking === monster.id ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>{MONSTER_COST}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Monsters;
