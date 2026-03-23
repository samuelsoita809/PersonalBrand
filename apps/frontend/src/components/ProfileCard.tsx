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
      
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl overflow-hidden">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-inner group-hover:border-blue-500/50 transition-colors duration-500">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        </div>

        {/* Fun Facts - Always Visible but Subtle */}
        <div className="flex flex-wrap justify-center gap-2 max-w-[240px]">
          {['Scalable Systems', 'Coffee Enthusiast ☕', 'Open Source ❤️', 'Design Driven'].map((fact, i) => (
            <span key={i} className="text-[10px] font-bold bg-white/5 border border-white/10 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-wider group-hover:text-white group-hover:border-blue-500/30 transition-all">
              {fact}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
