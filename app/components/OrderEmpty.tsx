import Image from "next/image";

const OrderEmpty = () => {
  return (
    <div className="text-center mt-8">
      <div className="flex justify-center">
        <Image
          src="/cart-empty.png" // Placeholder for the cart image
          alt="Empty Cart"
          width={200}
          height={200}
        />
      </div>
      <p className="text-gray-500 mt-4">No active orders</p>

      <div className="bg-white shadow-md rounded-lg mt-6 p-6 text-left">
        <h3 className="text-lg font-medium mb-2">
          How to Get a Phone Number and Use It to Get an SMS Code:
        </h3>

        <ol className="list-decimal list-inside text-sm space-y-3">
          <li>
            <strong>Top Up your Balance:</strong> Add funds to your balance via
            any of the payment methods we offer. Click on the profile icon, then
            &quot;Top up balance.&#34;
          </li>
          <li>
            <strong>Select a Service:</strong> Choose the service (like a
            website or app) where you need to get an SMS code. If your service
            isn’t listed, try the &quot;Other&quot; option.
          </li>
          <li>
            <strong>Select a Country:</strong> Choose countries/operators with
            high OTP delivery rates. See the sections &ldquo;Statistics&quot; or
            &ldquo;Prices&quot; to find the best options.
          </li>
          <li>
            <strong>Select an Operator and Click &quot;Buy&quot;:</strong>{" "}
            Pricing depends on your selected operator.
          </li>
          <li>
            <strong>Apply the Phone Number:</strong> Copy the phone number, then
            paste it where required.
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Click &quot;Cancel&ldquo; if you don’t want to continue.</li>
              <li>Click &quot;Rebuy&ldquo; if you need the number again.</li>
            </ul>
          </li>
          <li>
            <strong>Receive an SMS Code:</strong> After purchasing, you can
            receive unlimited SMS codes within 5-30 minutes. If a code isn’t
            delivered within 5 minutes, the service may cancel it, or you’ll be
            refunded.
          </li>
        </ol>

        <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
          <p>
            <strong>If you didn’t receive an OTP,</strong> you’ll be refunded
            automatically (it may take up to 15 minutes).
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderEmpty;
