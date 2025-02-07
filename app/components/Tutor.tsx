import React from "react";

function Tutor() {
  const tutorials_items = [
    {
      title: "Funding Your Wallet",
      description: "Learn how to fund your wallet",
      link: "/tutorials/funding-wallet", // Replace '#' with valid routes
    },
    {
      title: "User Dashboard Guide",
      description: "Learn how to navigate and use your user dashboard",
      link: "/tutorials/dashboard-guide",
    },
    {
      title: "SMS Services Tutorial",
      description: "Learn how to use our SMS verification services effectively",
      link: "/tutorials/sms-services",
    },
    {
      title: "Number Rental Guide",
      description:
        "Complete guide on renting and managing virtual phone numbers",
      link: "/tutorials/number-rental",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tutorials</h1>
      <iframe
        src="https://scribehow.com/embed/How_To_Use_Our_Service_on_smsglobenet_To_get_virtual_number_and_rent_a_number__5GxvQ4uUSAyLprtZs4QHng?as=scrollable"
        width="100%"
        height="640"
        allowFullScreen
        frameBorder="0"
      ></iframe>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials_items.map((tutorial, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-bold mb-2">{tutorial.title}</h2>
            <p className="text-gray-600 mb-4">{tutorial.description}</p>
            <a href={tutorial.link}>
              <a className="text-blue-600 font-medium hover:underline">
                Watch Tutorial →
              </a>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tutor;
