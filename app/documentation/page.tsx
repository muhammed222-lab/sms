import Image from "next/image";
import {
  FaBook,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaBuilding,
  FaGlobe,
} from "react-icons/fa";

export default function Documentation() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <FaBook className="mr-3 text-blue-500" />
            SMSGlobe Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive guides and resources for using SMSGlobe services
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-xl border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Getting Started
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    1. Creating an Account
                  </h3>
                  <p className="text-gray-600">
                    To begin using SMSGlobe, sign up for an account using your
                    email address. No credit card is required for the initial
                    registration.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    2. Renting a Number
                  </h3>
                  <p className="text-gray-600">
                    Browse our available numbers by country and service
                    compatibility. Select your desired number and rental
                    duration (from 1 hour to 30 days).
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    3. Receiving SMS
                  </h3>
                  <p className="text-gray-600">
                    Once rented, the number is immediately active. Any SMS sent
                    to this number will be forwarded to your account dashboard
                    in real-time.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-xl border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Advanced Features
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    API Integration
                  </h3>
                  <p className="text-gray-600">
                    Our REST API allows developers to programmatically rent
                    numbers and receive SMS. Documentation available in our
                    developer portal.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    Bulk Number Rental
                  </h3>
                  <p className="text-gray-600">
                    For businesses needing multiple numbers, we offer discounted
                    bulk packages with dedicated support.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">
                    Number Recycling
                  </h3>
                  <p className="text-gray-600">
                    All numbers are automatically recycled after use to maintain
                    service quality and prevent spam.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-8 rounded-xl border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaGlobe className="mr-2 text-blue-500" />
                Partner With Us
              </h2>
              <p className="text-gray-600 mb-6">
                Interested in becoming a reseller or integration partner? Fill
                out the form below and our business team will contact you.
              </p>

              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Partner Type
                  </label>
                  <select
                    id="type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an option</option>
                    <option value="reseller">Reseller</option>
                    <option value="integrator">Platform Integrator</option>
                    <option value="corporate">Corporate Client</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit Partnership Request
                </button>
              </form>
            </section>

            <section className="bg-white p-8 rounded-xl border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <FaPhone className="mr-2 text-blue-500" />
                Support
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaEnvelope className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-700">Email Support</h3>
                    <p className="text-gray-600">support@smsglobe.net</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaUserTie className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-700">
                      Business Inquiries
                    </h3>
                    <p className="text-gray-600">partners@smsglobe.net</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaBuilding className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-700">
                      Enterprise Solutions
                    </h3>
                    <p className="text-gray-600">enterprise@smsglobe.net</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
