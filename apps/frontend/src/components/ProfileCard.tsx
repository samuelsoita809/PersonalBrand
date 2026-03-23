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
      
      {/* Image Overlay/Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
      
      {/* Fun Facts Overlay */}
      <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
        <div className="flex flex-wrap gap-2">
          {['Loves Scalable Systems', 'Coffee Enthusiast ☕', 'Open Source ❤️', 'Design Driven'].map((fact, i) => (
            <span key={i} className="text-[10px] font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded-lg uppercase tracking-wider">
              {fact}
            </span>
          ))}
        </div>
      </div>

      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-inner">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
        
      </div>
    </div>
  );
};

export default ProfileCard;
