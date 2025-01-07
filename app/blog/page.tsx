"use client";

import React from "react";
import Link from "next/link";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "How SmsGlobe is Revolutionizing Virtual Verification",
      description:
        "Discover how SmsGlobe provides a secure and efficient alternative for temporary phone numbers.",
      date: "November 10, 2024",
      image: "/blog1.jpg",
      link: "/blog/revolutionizing-verification",
    },
    {
      id: 2,
      title: "5 Benefits of Using Temporary Phone Numbers",
      description:
        "Learn how temporary phone numbers can protect your privacy while streamlining your workflow.",
      date: "October 25, 2024",
      image: "/blog2.jpg",
      link: "/blog/benefits-of-temp-numbers",
    },
    {
      id: 3,
      title: "SmsGlobe: The Future of Secure Communication",
      description:
        "An in-depth look at how SmsGlobe ensures secure communication for businesses and individuals.",
      date: "September 15, 2024",
      image: "/blog3.jpg",
      link: "/blog/secure-communication-future",
    },
  ];

  return (
    <div className="py-12 px-4 w-[80%] m-auto">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Our Blog</h1>
          <p className="text-lg text-gray-600 mt-2">
            Stay updated with the latest news and insights from SmsGlobe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 mt-2">{post.date}</p>
                <p className="text-gray-600 mt-4">{post.description}</p>
                <Link
                  href={post.link}
                  className="inline-block mt-4 text-red-500 hover:underline"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
