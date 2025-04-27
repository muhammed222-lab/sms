// components/HowItWorksGallery.tsx
import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const HowItWorksGallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  // Enhanced image data with contextual descriptions from the PDF
  const images = [
    {
      id: 1,
      src: "/smsglobe-gallery/sms-globe-image-1.jpg",
      alt: "Insufficient balance notification",
      title: "Balance Alert",
      description:
        "Notification when users have insufficient balance ($0.00) to purchase a US Airbnb number ($0.16 USD).",
      category: "ui",
    },
    {
      id: 2,
      src: "/smsglobe-gallery/sms-globe-image-2.jpg",
      alt: "Crypto payment option",
      title: "Crypto Payments",
      description:
        "Secure crypto payment interface with 30-minute valid payment link for balance top-up.",
      category: "payments",
    },
    {
      id: 3,
      src: "/smsglobe-gallery/sms-globe-image-3.jpg",
      alt: "Order cancellation and troubleshooting",
      title: "Troubleshooting Guide",
      description:
        "Screen after order cancellation ($0.51 refunded) with tips for receiving OTPs and service selection for Togo.",
      category: "help",
    },
    {
      id: 4,
      src: "/smsglobe-gallery/sms-globe-image-4.jpg",
      alt: "Active orders for Google verification",
      title: "Active Orders",
      description:
        "Shows two active Google verification orders with US numbers, purchase details, and status (Pending SMS). Users can cancel orders for refunds.",
      category: "orders",
    },
    {
      id: 5,
      src: "/smsglobe-gallery/sms-globe-image-5.jpg",
      alt: "Active Facebook and WhatsApp orders",
      title: "Multiple Active Orders",
      description:
        "Two active orders for Facebook ($0.63) and WhatsApp ($1.89) verification with US numbers and pending SMS status.",
      category: "orders",
    },
    {
      id: 6,
      src: "/smsglobe-gallery/sms-globe-image-6.jpg",
      alt: "Dashboard with new number purchase",
      title: "Dashboard Overview",
      description:
        "Main dashboard showing successful number purchase ($0.50 USD) with country/service selection and saved preferences.",
      category: "ui",
    },
    {
      id: 7,
      src: "/smsglobe-gallery/sms-globe-image-7.jpg",
      alt: "WhatsApp verification completed",
      title: "WhatsApp Verification",
      description:
        "Completed WhatsApp verification (code 921214) for $0.50 USD with a US number (+15488788115).",
      category: "verification",
    },
    {
      id: 8,
      src: "/smsglobe-gallery/sms-globe-image-8.jpg",
      alt: "Total deposits overview",
      title: "Deposit Summary",
      description:
        "Dashboard showing total deposits (₦81,025.78) with transaction history including failed and pending transactions.",
      category: "payments",
    },
    {
      id: 9,
      src: "/smsglobe-gallery/sms-globe-image-9.jpg",
      alt: "Transaction details",
      title: "Transaction History",
      description:
        "Detailed view of a ₦1.25 transaction from 4/8/2025 with Flutterwave payment method showing pending status.",
      category: "payments",
    },
    {
      id: 10,
      src: "/smsglobe-gallery/sms-globe-image-10.jpg",
      alt: "Loading state",
      title: "Loading Interface",
      description: "Transitional loading screen during platform operations.",
      category: "ui",
    },
    {
      id: 11,
      src: "/smsglobe-gallery/sms-globe-image-11.jpg",
      alt: "POF verification pending",
      title: "Pending Verification",
      description:
        "Plenty of Fish (POF) verification in progress with US number (+18455304451) awaiting SMS code (000866).",
      category: "verification",
    },
    {
      id: 12,
      src: "/smsglobe-gallery/sms-globe-image-12.jpg",
      alt: "Order cancellation and service selection",
      title: "Service Selection",
      description:
        "Interface after order cancellation ($0.50 refunded) showing service selection for USA with recommended options like Google, Facebook, WhatsApp.",
      category: "ui",
    },
    {
      id: 13,
      src: "/smsglobe-gallery/sms-globe-image-13.jpg",
      alt: "Completed Google Voice verification",
      title: "Completed Verification",
      description:
        "A successfully completed Google Voice verification showing the received SMS code (374575) with options to complete or remove the order.",
      category: "verification",
    },
    {
      id: 14,
      src: "/smsglobe-gallery/sms-globe-image-14.jpg",
      alt: "Expired and canceled numbers",
      title: "Order History",
      description:
        "Displays historical numbers for services like Telegram and Airbnb, showing expiration dates and status (CANCELED, FINISHED, RECEIVED).",
      category: "orders",
    },
    {
      id: 15,
      src: "/smsglobe-gallery/sms-globe-image-15.jpg",
      alt: "WhatsApp for Nigeria selection",
      title: "Country-Specific Service",
      description:
        "Interface showing WhatsApp verification for Nigeria priced at $0.34 USD when in stock.",
      category: "numbers",
    },
    {
      id: 16,
      src: "/smsglobe-gallery/sms-globe-image-16.jpg",
      alt: "Temporary numbers for verification",
      title: "Temporary Numbers",
      description:
        "Displays free temporary numbers (like +213595930444 for TikTok) that expire in 19 minutes, with status indicators for message reception.",
      category: "numbers",
    },
    {
      id: 17,
      src: "/smsglobe-gallery/sms-globe-image-17.jpg",
      alt: "Payment deposit interface",
      title: "Deposit Funds",
      description:
        "The payment interface where users can deposit between ₦1,000 to ₦100,000 (approximately $6.24 USD equivalent) via Flutterwave payment gateway.",
      category: "payments",
    },
    {
      id: 18,
      src: "/smsglobe-gallery/sms-globe-image-18.jpg",
      alt: "SMS verification code received",
      title: "SMS Code Reception",
      description:
        "Shows a received SMS verification code (026675) for a service priced at $0.34 USD, with options to refresh, buy next, or remove the number.",
      category: "verification",
    },
  ];

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

  const openModal = useCallback((id: number) => {
    setSelectedImage(id);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === "Escape") {
          closeModal();
        } else if (e.key === "ArrowRight") {
          setSelectedImage((prev) => {
            const next = (prev || 0) + 1;
            return next > images.length ? images.length : next;
          });
        } else if (e.key === "ArrowLeft") {
          setSelectedImage((prev) => {
            const next = (prev || 0) - 1;
            return next < 1 ? 1 : next;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, closeModal, images.length]);

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900 bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Experience SMS Globe
          </h2>
          <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
            Discover how our platform makes SMS verification effortless and
            powerful
          </p>
        </motion.div>

        {/* Animated tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Image Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredImages.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              whileHover={{ y: -5 }}
              onMouseEnter={() => setIsHovering(image.id)}
              onMouseLeave={() => setIsHovering(null)}
              className="relative group cursor-pointer"
              onClick={() => openModal(image.id)}
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-xl transition-all duration-300 group-hover:shadow-2xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${toBase64(
                    shimmer(700, 475)
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
              {isHovering === image.id && (
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Modal */}
        <AnimatePresence>
          {selectedImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
              onClick={closeModal}
            >
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 text-white hover:text-gray-300 focus:outline-none z-10 transition-transform hover:scale-110"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col lg:flex-row gap-8 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full lg:w-2/3 h-1/2 lg:h-full bg-black">
                  <Image
                    src={`/smsglobe-gallery/sms-globe-image-${selectedImage}.jpg`}
                    alt={images[selectedImage - 1].alt}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                <div className="w-full lg:w-1/3 p-8 overflow-y-auto bg-gradient-to-b from-gray-800 to-gray-900">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-400">
                      Live Demo
                    </span>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4">
                    {images[selectedImage - 1].title}
                  </h3>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-gray-700 text-blue-400 rounded-full text-sm font-medium">
                      {images[selectedImage - 1].category
                        .charAt(0)
                        .toUpperCase() +
                        images[selectedImage - 1].category.slice(1)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400 text-sm">
                      Screenshot #{selectedImage}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-8 leading-relaxed">
                    {images[selectedImage - 1].description}
                  </p>

                  {/* Feature highlights */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {selectedImage === 2 && (
                        <>
                          <li className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300">
                              Deposit range: ₦1,000 to ₦100,000 (~$6.24)
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300">
                              Secure Flutterwave integration
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300">
                              Instant USD balance updates
                            </span>
                          </li>
                        </>
                      )}
                      {selectedImage === 4 && (
                        <>
                          <li className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300">
                              Google verification for $0.51 USD
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300">
                              US phone numbers available
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300">
                              Cancel anytime for full refund
                            </span>
                          </li>
                        </>
                      )}
                      {selectedImage === 12 && (
                        <>
                          <li className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300">
                              All popular services supported
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300">
                              Country-specific recommendations
                            </span>
                          </li>
                          <li className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-400 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-300">
                              Quick access to saved services
                            </span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-700">
                    <div className="flex justify-between gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) =>
                            prev && prev > 1 ? prev - 1 : prev
                          );
                        }}
                        className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg transition-all ${
                          selectedImage === 1
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gray-700 hover:bg-gray-600 text-white"
                        }`}
                        disabled={selectedImage === 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Previous
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) =>
                            prev && prev < images.length ? prev + 1 : prev
                          );
                        }}
                        className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg transition-all ${
                          selectedImage === images.length
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                        }`}
                        disabled={selectedImage === images.length}
                      >
                        Next
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// Utility functions for image placeholder
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
