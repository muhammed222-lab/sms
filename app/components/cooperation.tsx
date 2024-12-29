import React from "react";
import Image from "next/image";

const Cooperation = () => {
  const logos = [
    { src: "/netrc.png", alt: "Netrc Logo 1" },
    { src: "/ne.png", alt: "Netrc Logo 2" },
    { src: "/icon.png", alt: "Netrc Text" },
    { src: "/pav.png", alt: "PAV Logo" },
    { src: "/icon.png", alt: "SmsGlobe Logo" },
    { src: "/tech.png", alt: "Technology Logo" },
  ];

  return (
    <div className="w-full py-8 overflow-hidden">
      <h2 className="text-2xl font-bold text-red-500 mb-8 text-center">
        Cooperation
      </h2>

      <div className="relative">
        {/* First row of logos */}
        <div className="flex animate-scroll">
          {logos.map((logo, index) => (
            <div
              key={`logo-1-${index}`}
              className="flex-shrink-0 mx-12 w-32 h-16 relative"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain"
              />
            </div>
          ))}
          {/* Duplicate logos for seamless scroll */}
          {logos.map((logo, index) => (
            <div
              key={`logo-2-${index}`}
              className="flex-shrink-0 mx-12 w-32 h-16 relative"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cooperation;
