// components/HowItWorksGallery/MainGallery.tsx
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { images } from "./HowItWorksGallery/galleryData";
import Masonry from "react-masonry-css";

const breakpointColumnsObj = {
  default: 3,
  1024: 2,
  640: 1,
};

const HowItWorksGallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredImages =
    activeCategory === "all"
      ? images
      : images.filter((image) => image.category === activeCategory);

  const categories = [
    { id: "all", name: "All Features" },
    { id: "verification", name: "Verification" },
    { id: "payments", name: "Payments" },
    { id: "numbers", name: "Phone Numbers" },
    { id: "orders", name: "Order Management" },
    { id: "ui", name: "Dashboard" },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Experience SMS Globe
          </h2>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Discover how our platform makes SMS verification effortless and
            powerful
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 overflow-x-auto py-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex gap-6"
          columnClassName="flex flex-col gap-6"
        >
          {filteredImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              className="relative group"
            >
              <Link href={`/HowItWorksGallery/${image.id}`} passHref>
                <div className="relative overflow-hidden rounded-2xl border border-gray-200 transition-all duration-300 group-hover:shadow-xl cursor-pointer">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={600}
                    height={800}
                    className="w-full h-auto object-cover"
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${toBase64(
                      shimmer(600, 800)
                    )}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {image.title}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {image.description.substring(0, 80)}...
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </Masonry>
      </div>
    </section>
  );
};

// Utility functions
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1e293b" offset="20%" />
      <stop stop-color="#334155" offset="50%" />
      <stop stop-color="#1e293b" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1e293b" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export default HowItWorksGallery;
