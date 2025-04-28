// components/HowItWorksGallery/GalleryDetail.tsx
import Image from "next/image";
import Link from "next/link";

interface ImageProps {
  src: string;
  alt: string;
  category: string;
  title: string;
  description: string;
  extendedDescription?: string;
  id: number;
}

const GalleryDetail = ({ image }: { image: ImageProps }) => {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="md:flex">
        <div className="md:w-2/3 p-2 bg-gray-100 flex items-center justify-center">
          <div className="relative w-full h-96 md:h-auto aspect-video">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="md:w-1/3 p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{image.title}</h1>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 mb-4">{image.description}</p>

            {image.extendedDescription && (
              <div className="text-gray-600">{image.extendedDescription}</div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Link
              href={`/HowItWorksGallery/${
                image.id > 1 ? image.id - 1 : image.id
              }`}
              className={`px-4 py-2 rounded-lg ${
                image.id === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/HowItWorksGallery/${
                image.id < 18 ? image.id + 1 : image.id
              }`}
              className={`px-4 py-2 rounded-lg ${
                image.id === 18
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryDetail;
