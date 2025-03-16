import { FaCheckCircle } from "react-icons/fa";

const Explanation = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Who Can Benefit Section */}
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Who Can Benefit from Receiving SMS Codes Online
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Webmasters",
            "SMM specialists",
            "Entrepreneurs",
            "Those involved in bulk account registration",
            "SERM and ORM specialists",
            "Anyone who needs to create a second account on Instagram, VK, TikTok, Telegram, etc.",
          ].map((item, index) => (
            <span
              key={index}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mt-4 text-gray-600">
          Your phone and SIM card are no longer a requirement all you need is
          Internet access.
        </p>
      </section>

      {/* How to Receive an SMS Section */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-center mb-6">
          How to Receive an SMS using a Virtual Number
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Get a Virtual Phone Number",
              description:
                "Choose the service, country, and operator you need, and buy a number. Alternatively, sort the numbers the other way around and first choose the country, then service and operator.",
            },
            {
              title: "Use the Virtual Number to Receive an SMS code",
              description:
                "Copy the phone number you received and paste it to the registration form of the service that you need an SMS code for.",
            },
            {
              title: "Complete Verification",
              description:
                "Use the verification code from the SMS you received to register an account on the service of your choice.",
            },
          ].map((step, index) => (
            <div
              key={index}
              className="p-6 border rounded-lg shadow-sm bg-white"
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-500 text-2xl font-bold">
                  {index + 1}
                </span>
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mt-2">{step.title}</h3>
              <p className="text-gray-600 mt-1">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Explanation;
