import Link from "next/link";
import {
  FaHome,
  FaInfoCircle,
  FaServer,
  FaBlog,
  FaChartLine,
  FaSearch,
  FaTags,
  FaQuestionCircle,
  FaEnvelope,
} from "react-icons/fa";
import Image from "next/image";
export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Image
            src="/deemax.png"
            alt="smsglobe"
            width={300}
            height={300}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SMSGlobe Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about buying and using burner numbers
            for SMS verification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl border">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              About SMSGlobe
            </h2>
            <p className="text-gray-600 mb-6">
              SMSGlobe provides temporary phone numbers for SMS verification,
              helping you protect your privacy when signing up for online
              services. Our numbers work with hundreds of platforms worldwide.
            </p>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Why Use Our Service?
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Protect your personal number from spam</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Bypass SMS verification requirements</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>
                  Instant activation with numbers from multiple countries
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Affordable pricing with no long-term commitments</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl border">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Getting Started
            </h2>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              How It Works:
            </h3>
            <ol className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3">
                  1
                </span>
                <span>Choose a country and service you need</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3">
                  2
                </span>
                <span>Rent a number instantly</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3">
                  3
                </span>
                <span>
                  Use it for verification - we&apos;ll forward the SMS to you
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3">
                  4
                </span>
                <span>
                  Number automatically expires after your rental period
                </span>
              </li>
            </ol>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Quick Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickLink href="/" icon={<FaHome />} title="Home" />
              <QuickLink
                href="/about"
                icon={<FaInfoCircle />}
                title="About Us"
              />
              <QuickLink
                href="/services"
                icon={<FaServer />}
                title="Services"
              />
              <QuickLink href="/blog" icon={<FaBlog />} title="Blog" />
              <QuickLink
                href="/strategy"
                icon={<FaChartLine />}
                title="Strategy"
              />
              <QuickLink
                href="/research"
                icon={<FaSearch />}
                title="Research"
              />
              <QuickLink href="/pricing" icon={<FaTags />} title="Pricing" />
              <QuickLink href="/faq" icon={<FaQuestionCircle />} title="FAQ" />
              <QuickLink
                href="mailto:support@smsglobe.net"
                icon={<FaEnvelope />}
                title="Contact Us"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <span className="text-blue-500 mr-3 text-xl">{icon}</span>
      <span className="font-medium text-gray-700">{title}</span>
    </Link>
  );
}
