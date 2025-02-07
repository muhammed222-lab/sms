import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { FaClipboard } from "react-icons/fa";
import RecentSmsOrders from "./RecentSmsOrders";

import countryList from "../../api/countryList.json"; // Import country list
import servicesList from "../../api/servicesList.json"; // Import service list
import SmsPrice from "./SmsPrice";

// Define proper interfaces for Country and Service
interface User {
  email: string | null;
  displayName: string | null;
}

interface Country {
  title: string;
  id: string;
}

interface Service {
  title: string;
  id: string;
  price?: number;
}

interface SelectOption {
  label: string;
  value: string;
}

interface RequestedNumber {
  request_id: string;
  number: string;
}
interface SmsOrder {
  orderId: string;
  number: string;
  code: string;
  country: string;
  service: string;
  applicationId: string;
  status: string;
  action: string;
  price: number; // Add the price field
  user_email: string; // Add the user_email field
  date: string; // Ensure the date field is included
}

const Sms = () => {
  const [user, setUser] = useState<User | null>(null);
  const [countries, setCountries] = useState<SelectOption[]>([]);
  const [services, setServices] = useState<
    Array<SelectOption & { price: number }>
  >([]);
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(
    null
  );
  const [selectedService, setSelectedService] = useState<
    SelectOption & { price: number }
  >();
  const [requestedNumber, setRequestedNumber] =
    useState<RequestedNumber | null>(null);
  const [smsCode, setSmsCode] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isFetchingCode, setIsFetchingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setBalance] = useState<number>(0);
  const [, setStatus] = useState<string>(""); // Declare status state
  const [orders, setOrders] = useState<SmsOrder[]>([]); // Ensure orders include price and user_email
  const [previouslyGeneratedOrders, setPreviouslyGeneratedOrders] = useState<
    SmsOrder[]
  >([]); // Add state for previously generated numbers

  // Fetch Firebase user and balance
  useEffect(() => {
    if (user?.email) {
      const fetchOrders = async () => {
        const q = query(
          collection(db, "orders"),
          where("user_email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(
          (doc) => doc.data() as SmsOrder
        );
        setPreviouslyGeneratedOrders(ordersData); // Save fetched orders to state
      };
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email || null,
          displayName: currentUser.displayName || null,
        });

        try {
          const userEmail = currentUser.email || "";
          const q = query(
            collection(db, "userDeposits"),
            where("email", "==", userEmail)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            setBalance(userData.amount ?? 0);
          } else {
            setBalance(0);
          }
        } catch (error) {
          console.error("Error fetching user balance:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load countries and services from local JSON
  useEffect(() => {
    setLoading(true);

    try {
      const parsedCountries = Object.values(countryList).map(
        (country: Country) => ({
          label: country.title,
          value: country.id,
        })
      );
      setCountries(parsedCountries);

      const parsedServices = Object.values(servicesList).map(
        (service: Service) => ({
          label: service.title,
          value: service.id,
          price: service.price || 0,
        })
      );
      setServices(parsedServices);
    } catch (error) {
      console.error("Error loading local data:", error);
      setMessage({
        type: "error",
        content: "Error loading local data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Update the orders array after requesting a new number
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage({ type: "success", content: "Copied!" });
      setTimeout(() => {
        setMessage({ type: "", content: "" });
      }, 5000); // Hide message after 5 seconds
    });
  };

  const exchangeRates: { [key: string]: number } = {
    USD: 1,
    EUR: 0.85,
    NGN: 410,
    // Add other currencies as needed
  };

  const handleRequestNumber = async () => {
    if (!selectedCountry || !selectedService) {
      setMessage({
        type: "error",
        content: "Please select a country and a service.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", content: "" });

    try {
      // Fetch the SMS-Man balance via our proxy API (api/proxy-sms)
      const smsManBalance = await fetch("/api/proxy-sms?action=get-balance")
        .then((response) => response.json())
        .then((data) => data.balance)
        .catch(() => {
          setMessage({
            type: "error",
            content:
              "Service is temporarily unavailable due to insufficient funds on our end. We apologize for the inconvenience.",
          });
          return 0;
        });

      // If SMS-Man balance is not enough, show message and return
      if (smsManBalance < selectedService.price) {
        setMessage({
          type: "error",
          content:
            "Service is temporarily unavailable due to insufficient funds on our end. We apologize for the inconvenience.",
        });
        return;
      }

      // Fetch the user balance from Firestore
      const userEmail = user?.email || "";
      const userBalanceQuery = query(
        collection(db, "userDeposits"),
        where("email", "==", userEmail)
      );
      const userBalanceSnapshot = await getDocs(userBalanceQuery);

      if (!userBalanceSnapshot.empty) {
        const userDoc = userBalanceSnapshot.docs[0].data();
        const userBalanceInLocalCurrency = userDoc.amount || 0;

        // Convert the SMS-Man price to the user's currency
        const conversionRate = exchangeRates[userDoc.currency] || 1;
        const servicePriceInUserCurrency =
          selectedService.price * conversionRate;

        // Add 5% commission to the service price
        const totalPriceInUserCurrency = servicePriceInUserCurrency * 1.05;

        // Check if user balance is enough for the service
        if (userBalanceInLocalCurrency < totalPriceInUserCurrency) {
          setMessage({
            type: "error",
            content: "Insufficient balance. Please top up your account.",
          });
          return;
        }

        // Log user balance details for testing
        console.log(
          `User Balance in Local Currency: ${userBalanceInLocalCurrency}`
        );
        console.log(
          `Service Price in User Currency: ${servicePriceInUserCurrency}`
        );
        console.log(
          `Total Price in User Currency (including commission): ${totalPriceInUserCurrency}`
        );

        // Proceed with number request if balances are sufficient
        const response = await fetch(
          `/api/proxy-sms?action=get-number&country_id=${selectedCountry.value}&application_id=${selectedService.value}`
        );
        const data = await response.json();

        if (data.number) {
          setRequestedNumber(data);
          setMessage({
            type: "success",
            content: `Number fetched successfully: ${data.number}`,
          });

          // Deduct the total service price with commission from the user's balance
          const newBalanceInLocalCurrency =
            userBalanceInLocalCurrency - totalPriceInUserCurrency;

          // Log balance deduction for testing
          console.log(
            `Remaining Balance in Local Currency: ${newBalanceInLocalCurrency}`
          );

          // Update the user balance in Firestore
          const userDocRef = userBalanceSnapshot.docs[0].ref;
          await updateDoc(userDocRef, { amount: newBalanceInLocalCurrency });

          // Create a new order object and save it to Firestore
          const newOrder = {
            orderId: data.request_id,
            number: data.number,
            code: "",
            country: selectedCountry.label,
            service: selectedService.label,
            applicationId: selectedService.value,
            status: "Pending", // Default status
            action: "reject", // Default action
            price: totalPriceInUserCurrency, // Store the price in user's currency
            user_email: user?.email || "",
            date: new Date().toISOString(), // Store the current date
          };

          // Insert the new order into Firestore
          await addDoc(collection(db, "orders"), newOrder);

          // Update the Recent SMS Orders table with the new order
          setOrders((prevOrders) => [...prevOrders, newOrder]);
        } else {
          setMessage({
            type: "error",
            content: "Failed to fetch number. Please try again later.",
          });
        }
      } else {
        setMessage({
          type: "error",
          content: "No user balance found. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error requesting number:", error);
      setMessage({
        type: "error",
        content: "Failed to request a number. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update order status when rejecting
  const rejectNumber = async () => {
    if (requestedNumber) {
      try {
        const response = await fetch(
          `/api/proxy-sms?action=set-status&request_id=${requestedNumber.request_id}&status=rejected`
        );
        const data = await response.json();

        if (data.success) {
          setMessage({
            type: "success",
            content: "Number status updated to rejected.",
          });
          setStatus("rejected");

          // Update the status in the orders array
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.orderId === requestedNumber.request_id
                ? { ...order, status: "Rejected" } // Update status here
                : order
            )
          );
        } else {
          setMessage({
            type: "error",
            content: "Failed to reject the number.",
          });
        }
      } catch (error) {
        console.error("Error rejecting number:", error);
        setMessage({
          type: "error",
          content: "Failed to reject the number. Please try again.",
        });
      }
    }
  };

  const fetchSmsCode = async () => {
    if (!requestedNumber) {
      setMessage({ type: "error", content: "No requested number found." });
      return;
    }

    setIsFetchingCode(true);

    try {
      const response = await fetch(
        `/api/proxy-sms?action=get-sms&request_id=${requestedNumber.request_id}`
      );
      const data = await response.json();

      if (data.sms_code) {
        setSmsCode(data.sms_code);
        setMessage({ type: "success", content: "SMS code received." });
      } else if (data.error_code === "wait_sms") {
        setMessage({
          type: "info",
          content: "Waiting for SMS. Please check back shortly.",
        });
      } else {
        throw new Error(data.error || "Failed to fetch SMS.");
      }
    } catch (error) {
      console.error("Error fetching SMS code:", error);
      setMessage({ type: "error", content: "Error fetching SMS code." });
    } finally {
      setIsFetchingCode(false);
    }
  };

  return (
    <div className="bg-white border p-4 rounded-lg max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">New SMS</h2>
      {message.content && (
        <div
          className={`p-2 mb-4 rounded text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-600"
              : message.type === "success"
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {message.content}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a country
        </label>
        <Select
          options={countries}
          value={selectedCountry}
          onChange={setSelectedCountry}
          placeholder="Search by country..."
          isLoading={loading}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select a service
        </label>
        <Select
          options={services}
          value={selectedService}
          onChange={(option) =>
            setSelectedService(option as (typeof services)[0])
          }
          placeholder="Search by service..."
          isLoading={loading}
        />
      </div>
      <button
        onClick={handleRequestNumber}
        className={`bg-blue-500 text-white px-4 py-2 rounded ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        }`}
        disabled={loading}
      >
        {loading ? "Processing..." : "Get Number"}
      </button>
      {requestedNumber && (
        <div className="mt-4">
          <p className="text-sm">Phone Number: {requestedNumber.number}</p>
          <button
            onClick={() => handleCopy(requestedNumber.number)}
            className="text-blue-500 text-sm flex items-center gap-1"
          >
            <FaClipboard /> Copy
          </button>

          <button
            onClick={fetchSmsCode}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            disabled={isFetchingCode}
          >
            {isFetchingCode ? "Waiting for Code..." : "Fetch SMS Code"}
          </button>

          {smsCode && <p className="text-sm mt-2">SMS Code: {smsCode}</p>}
        </div>
      )}
      {/* // Pass the previously generated orders to RecentSmsOrders component */}
      <RecentSmsOrders
        orders={orders} // Pass the updated orders state
        previouslyGeneratedOrders={previouslyGeneratedOrders} // Pass the previously generated orders
        rejectNumber={rejectNumber}
        fetchSmsCode={fetchSmsCode}
        handleCopy={handleCopy}
      />

      <SmsPrice />
    </div>
  );
};

export default Sms;
