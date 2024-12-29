import { FaHome, FaSms, FaCog } from "react-icons/fa";

const Sidebar: React.FC = () => {
  return (
    <div className="w-full lg:w-64 h-full bg-gray-50 ">
      {/* Navigation */}
      <nav className="mt-6">
        <ul>
          <li className="flex items-center px-6 py-3 text-orange-500 font-semibold bg-gray-100">
            <FaHome className="mr-3" />
            Dashboard
          </li>
          <li className="flex items-center px-6 py-3 text-gray-600 hover:text-orange-500 hover:bg-gray-100">
            <FaSms className="mr-3" />
            Receive SMS
          </li>
          <li className="flex items-center px-6 py-3 text-gray-600 hover:text-orange-500 hover:bg-gray-100">
            <FaCog className="mr-3" />
            Settings
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t">
        <p className="text-sm text-gray-500 text-center">
          username123
          <br />
          username123@email.com
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
