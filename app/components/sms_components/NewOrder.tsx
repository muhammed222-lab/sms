import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IoMdRefresh } from "react-icons/io";

const NewOrder = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-white shadow-md rounded-lg">
      <div className="relative flex-grow">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <button className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
        <IoMdRefresh />
        Refresh
      </button>
    </div>
  );
};

export default NewOrder;
