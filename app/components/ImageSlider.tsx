"use client";

import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const images = ["/image2.png", "/image3.png", "/image1.png"];

export default function ImageSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true, // Enable automatic scrolling
    autoplaySpeed: 2000, // Set scroll speed in milliseconds
    centerMode: true,
    centerPadding: "0",
  };

  return (
    <div
      className="relative mx-auto p-10 bg-no-repeat bg-center rounded-lg"
      style={{
        maxWidth: "420px",
        borderRadius: "15px",
        backgroundRepeat: "no-repeat",
        backdropFilter: "blur(10px)",
        padding: "10px",
      }}
    >
      <Slider {...settings}>
        {images.map((src, index) => (
          <div key={index} className="slick-slide flex justify-center">
            <div className="p-2 mx-2">
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                width={200}
                height={280}
                className="rounded-full object-cover" // Ensures images are circular
                style={{ borderRadius: "12px" }} // Backup for rounded style
              />
            </div>
          </div>
        ))}
      </Slider>

    
    </div>
  );
}
