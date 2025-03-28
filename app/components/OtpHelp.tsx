import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function OtpHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVisibility = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white border rounded-lg mt-4 shadow-sm">
      <div
        className="py-2 px-4 flex justify-between items-center cursor-pointer rounded-t-lg"
        onClick={toggleVisibility}
      >
        <h2 className="text-base font-semibold">Can&apos;t receive OTP?</h2>
        <button className="text-gray-500 hover:text-gray-700">
          {isOpen ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
        </button>
      </div>

      <div
        className={`p-3 space-y-3 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {[
          "Try requesting the SMS message for the service you need again.",
          "Use a different browser or device for signing up.",
          <>
            Study the{" "}
            <a href="/statistic" className="text-blue-600 font-medium">
              Statistics
            </a>{" "}
            to make sure you are using the operator with the best delivery rate.
          </>,
        ].map((text, index) => (
          <div key={index} className="flex items-start space-x-3">
            <span className="text-orange-500 font-bold">{index + 1}</span>
            <p className="bg-blue-100 text-blue-900 p-2 rounded-md">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
