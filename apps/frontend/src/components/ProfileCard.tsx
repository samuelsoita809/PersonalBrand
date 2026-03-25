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
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-8 shadow-2xl overflow-hidden transition-all duration-500 group-hover:border-blue-500/30">
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
