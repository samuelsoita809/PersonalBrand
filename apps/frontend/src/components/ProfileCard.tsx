import React from 'react';

interface ProfileCardProps {
  name?: string;
  role?: string;
  image?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  name = "Samuel Soita", 
  role = "Founder & Lead Engineer", 
  image = "/profile.png" 
}) => {
  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      
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

        {/* Fun Facts Section */}
        <div className="w-full space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold whitespace-nowrap">Fun Facts</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { text: 'Built first PC at 12', icon: '🖥️' },
              { text: 'Lo-fi beats only', icon: '🎧' },
              { text: 'Complex maze lover', icon: '🧩' },
              { text: 'Early morning hiker', icon: '🥾' }
            ].map((fact, i) => (
              <div 
                key={i} 
                className="group/fact bg-white/[0.03] border border-white/5 p-2 rounded-xl hover:bg-white/[0.08] hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs grayscale group-hover/fact:grayscale-0 transition-all">{fact.icon}</span>
                  <span className="text-[10px] text-slate-400 group-hover/fact:text-white leading-tight font-medium">
                    {fact.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
