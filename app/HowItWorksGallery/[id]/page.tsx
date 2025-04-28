// app/HowItWorksGallery/[id]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { images } from "../../components/HowItWorksGallery/galleryData";
import GalleryDetail from "../../components/HowItWorksGallery/GalleryDetail";
import RelatedItems from "../../components/HowItWorksGallery/RelatedItems";
import { useEffect, useState, use } from "react";
import Header from "@/app/components/header";

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
  category: string;
  extendedDescription?: string;
}

export default function GalleryItemPage({
  params,
}: {
  params: Promise<{ id: string }>; // Note params is now a Promise
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState<GalleryImage | null>(null);
  const [relatedItems, setRelatedItems] = useState<GalleryImage[]>([]);

  // Properly unwrap the params promise
  const unwrappedParams = use(params);

  useEffect(() => {
    if (unwrappedParams?.id) {
      const foundImage = images.find(
        (img) => img.id.toString() === unwrappedParams.id
      );

      if (foundImage) {
        setCurrentImage(foundImage);
        const related = images
          .filter(
            (img) =>
              img.category === foundImage.category && img.id !== foundImage.id
          )
          .slice(0, 3);
        setRelatedItems(related);
      }
      setLoading(false);
    }
  }, [unwrappedParams?.id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (!currentImage)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Item not found
      </div>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Gallery
          </button>

          <GalleryDetail image={currentImage} />

          {relatedItems.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Related Features</h2>
              <RelatedItems
                items={relatedItems.map((item) => ({
                  ...item,
                  id: item.id.toString(),
                }))}
                currentId={currentImage.id.toString()}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
