import React from "react";
import Image from "next/image";

const Cooperation = () => {
  // Array of company logos (using placeholder images from popular tech companies)
  const companyLogos = [
    { src: "https://logo.clearbit.com/twilio.com", alt: "Twilio" },
    { src: "https://logo.clearbit.com/plivo.com", alt: "Plivo" },
    { src: "https://logo.clearbit.com/nexmo.com", alt: "Vonage" },
    { src: "https://logo.clearbit.com/bandwidth.com", alt: "Bandwidth" },
    { src: "https://logo.clearbit.com/amazon.com", alt: "AWS" },
    { src: "https://logo.clearbit.com/microsoft.com", alt: "Microsoft" },
    { src: "https://logo.clearbit.com/google.com", alt: "Google" },
    { src: "https://logo.clearbit.com/sinch.com", alt: "Sinch" },
    { src: "https://logo.clearbit.com/messagebird.com", alt: "MessageBird" },
    { src: "https://logo.clearbit.com/telegram.org", alt: "Telegram" },
    { src: "https://logo.clearbit.com/whatsapp.com", alt: "WhatsApp" },
    { src: "https://logo.clearbit.com/signal.org", alt: "Signal" },
  ];

  // Duplicate the array for seamless looping
  const duplicatedLogos = [...companyLogos, ...companyLogos];

  return (
    <div className="w-full py-12  overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Trusted by Leading Communication Platforms
        </h2>

        <div className="relative group">
          {/* Scrolling container */}
          <div className="relative overflow-hidden">
            <div className="flex animate-infinite-scroll group-hover:pause">
              {duplicatedLogos.map((logo, index) => (
                <div
                  key={`logo-${index}`}
                  className="flex-shrink-0 px-8 w-48 h-24 relative transition-all duration-300 hover:scale-105"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={160}
                      height={80}
                      className="object-contain object-center grayscale hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/default-logo.png";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient fade effect */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
        </div>
      </div>

      {/* Custom animation */}
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          display: flex;
          width: max-content;
          animation: scroll 30s linear infinite;
        }
        .group:hover .animate-infinite-scroll {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Cooperation;
