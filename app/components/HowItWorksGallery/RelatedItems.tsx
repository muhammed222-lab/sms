/* eslint-disable @typescript-eslint/no-unused-vars */
// components/HowItWorksGallery/RelatedItems.tsx
import Link from "next/link";
import Image from "next/image";

interface RelatedItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
}

interface RelatedItemsProps {
  items: RelatedItem[];
  currentId: string;
}

const RelatedItems = ({ items, currentId }: RelatedItemsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <Link key={item.id} href={`/HowItWorksGallery/${item.id}`} passHref>
          <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative h-48">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RelatedItems;
