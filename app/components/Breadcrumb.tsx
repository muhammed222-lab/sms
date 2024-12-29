// Breadcrumb.tsx
import React from "react";
import Link from "next/link";

type BreadcrumbProps = {
  items: { label: string; href: string }[];
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <div className="mb-4 text-sm text-gray-500">
      {items.map((item, index) => (
        <span key={item.href}>
          <Link href={item.href} className="hover:text-blue-500">
            {item.label}
          </Link>
          {index < items.length - 1 && " > "}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumb;
