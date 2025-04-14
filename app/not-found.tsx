// app/not-found.tsx
import Link from "next/link";
import Image from "next/image";
import {
  FaHome,
  FaChartLine,
  FaSms,
  FaPhone,
  FaCog,
  FaUser,
  FaTag,
} from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl border overflow-hidden p-8 text-center">
        <div className="mb-8">
          <Image
            src="/deemax.png"
            alt="smsglobe"
            width={300}
            height={300}
            className="mx-auto mb-4"
          />
          <h1 className="text-9xl font-bold text-blue-500 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-medium text-gray-700 mb-4">
            Where were you trying to go?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NavLink href="/" icon={<FaHome />} label="Home" />
            <NavLink
              href="/dashboard"
              icon={<FaChartLine />}
              label="Dashboard"
            />
            <NavLink href="/dashboard" icon={<FaSms />} label="New SMS" />
            <NavLink href="/dashboard" icon={<FaPhone />} label="Rent Number" />
            <NavLink href="/settings" icon={<FaCog />} label="Settings" />
            <NavLink href="/profile" icon={<FaUser />} label="Profile" />
            <NavLink
              href="/statistic"
              icon={<FaChartLine />}
              label="Statistics"
            />
            <NavLink href="/pricing" icon={<FaTag />} label="Pricing" />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Need more help?
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/help-center"
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Help Center
            </Link>
            <Link
              href="/documentation"
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
    >
      <span className="text-xl mb-2">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
