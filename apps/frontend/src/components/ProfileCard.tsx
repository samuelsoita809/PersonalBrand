import React from 'react';

interface ProfileCardProps {
  name?: string;
  image?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  name = "Samuel Soita", 
  image = "/profile.png" 
}) => {
  return (
    <div className="relative group">
      {/* Value Badges - Floating around the card */}
      <div className="absolute -top-6 -left-6 z-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="bg-blue-600/10 backdrop-blur-md border border-blue-500/20 px-3 py-1.5 rounded-xl shadow-xl">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">50+ Peers Mentored</span>
        </div>
      </div>
      
      <div className="absolute -top-12 -right-4 z-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <div className="bg-purple-600/10 backdrop-blur-md border border-purple-500/20 px-3 py-1.5 rounded-xl shadow-xl">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">3+ Targeted Industries</span>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-8 z-20 animate-in fade-in slide-in-from-top-4 duration-700 delay-500">
        <div className="bg-emerald-600/10 backdrop-blur-md border border-emerald-500/20 px-3 py-1.5 rounded-xl shadow-xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">12+ Projects Built</span>
        </div>
      </div>

      <div className="absolute -bottom-10 -right-6 z-20 animate-in fade-in slide-in-from-top-4 duration-700 delay-700">
        <div className="bg-amber-600/10 backdrop-blur-md border border-amber-500/20 px-3 py-1.5 rounded-xl shadow-xl">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">100% Quality Focus</span>
        </div>
      </div>

      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-8 shadow-2xl overflow-hidden">
        {/* Profile Image */}
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-inner group-hover:border-blue-500/50 transition-colors duration-500 relative">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Brand Text */}
        <div className="text-center">
            <h3 className="text-2xl font-black text-white tracking-tight">{name}</h3>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
