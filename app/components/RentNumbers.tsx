/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import React, { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiInfo } from "react-icons/fi";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Select from "react-select";

interface Product {
  Category: string;
  Qty: number;
  Price: number;
}

interface Order {
  id: string;
  user_email: string;
  phone: string;
  operator: string;
  product: string;
  price: number;
  status: string;
  expires: string;
  sms: SMS[];
  created_at: string;
  country: string;
  order_id: string;
  duration: string;
  originalPrice: number;
  finalPrice: number;
}

interface SMS {
  created_at: string;
  date: string;
  sender: string;
  text: string;
  code: string;
}

const RentNumbers: React.FC = () => {
  const [countries, setCountries] = useState<
    { display: string; code: string }[]
  >([
    { display: "Afghanistan", code: "afghanistan" },
    { display: "Albania", code: "albania" },
    { display: "Venezuela", code: "venezuela" },
    { display: "Vietnam", code: "vietnam" },
    { display: "Zambia", code: "zambia" },
    { display: "Algeria", code: "algeria" },
    { display: "Angola", code: "angola" },
    { display: "Antigua and Barbuda", code: "antiguaandbarbuda" },
    { display: "Argentina", code: "argentina" },
    { display: "Armenia", code: "armenia" },
    { display: "Aruba", code: "aruba" },
    { display: "Australia", code: "australia" },
    { display: "Austria", code: "austria" },
    { display: "Azerbaijan", code: "azerbaijan" },
    { display: "Bahamas", code: "bahamas" },
    { display: "Bahrain", code: "bahrain" },
    { display: "Bangladesh", code: "bangladesh" },
    { display: "Barbados", code: "barbados" },
    { display: "Belarus", code: "belarus" },
    { display: "Belgium", code: "belgium" },
    { display: "Belize", code: "belize" },
    { display: "Benin", code: "benin" },
    { display: "Bhutan", code: "bhutane" },
    { display: "Bosnia and Herzegovina", code: "bih" },
    { display: "Bolivia", code: "bolivia" },
    { display: "Botswana", code: "botswana" },
    { display: "Brazil", code: "brazil" },
    { display: "Bulgaria", code: "bulgaria" },
    { display: "Burkina Faso", code: "burkinafaso" },
    { display: "Burundi", code: "burundi" },
    { display: "Cambodia", code: "cambodia" },
    { display: "Cameroon", code: "cameroon" },
    { display: "Canada", code: "canada" },
    { display: "Cape Verde", code: "capeverde" },
    { display: "Chad", code: "chad" },
    { display: "Chile", code: "chile" },
    { display: "Colombia", code: "colombia" },
    { display: "Comoros", code: "comoros" },
    { display: "Congo", code: "congo" },
    { display: "Costa Rica", code: "costarica" },
    { display: "Croatia", code: "croatia" },
    { display: "Cyprus", code: "cyprus" },
    { display: "Czechia", code: "czech" },
    { display: "Denmark", code: "denmark" },
    { display: "Dominican Republic", code: "dominicana" },
    { display: "East Timor", code: "easttimor" },
    { display: "Ecuador", code: "ecuador" },
    { display: "Egypt", code: "egypt" },
    { display: "England", code: "england" },
    { display: "Equatorial Guinea", code: "equatorialguinea" },
    { display: "Estonia", code: "estonia" },
    { display: "Ethiopia", code: "ethiopia" },
    { display: "Finland", code: "finland" },
    { display: "France", code: "france" },
    { display: "French Guiana", code: "frenchguiana" },
    { display: "Gabon", code: "gabon" },
    { display: "Gambia", code: "gambia" },
    { display: "Georgia", code: "georgia" },
    { display: "Germany", code: "germany" },
    { display: "Ghana", code: "ghana" },
    { display: "Gibraltar", code: "gibraltar" },
    { display: "Greece", code: "greece" },
    { display: "Guadeloupe", code: "guadeloupe" },
    { display: "Guatemala", code: "guatemala" },
    { display: "Guinea-Bissau", code: "guineabissau" },
    { display: "Guyana", code: "guyana" },
    { display: "Haiti", code: "haiti" },
    { display: "Honduras", code: "honduras" },
    { display: "Hong Kong", code: "hongkong" },
    { display: "Hungary", code: "hungary" },
    { display: "India", code: "india" },
    { display: "Indonesia", code: "indonesia" },
    { display: "Ireland", code: "ireland" },
    { display: "Israel", code: "israel" },
    { display: "Italy", code: "italy" },
    { display: "Ivory Coast", code: "ivorycoast" },
    { display: "Jamaica", code: "jamaica" },
    { display: "Jordan", code: "jordan" },
    { display: "Kazakhstan", code: "kazakhstan" },
    { display: "Kenya", code: "kenya" },
    { display: "Kuwait", code: "kuwait" },
    { display: "Kyrgyzstan", code: "kyrgyzstan" },
    { display: "Laos", code: "laos" },
    { display: "Latvia", code: "latvia" },
    { display: "Lesotho", code: "lesotho" },
    { display: "Liberia", code: "liberia" },
    { display: "Lithuania", code: "lithuania" },
    { display: "Luxembourg", code: "luxembourg" },
    { display: "Macau", code: "macau" },
    { display: "Madagascar", code: "madagascar" },
    { display: "Malawi", code: "malawi" },
    { display: "Malaysia", code: "malaysia" },
    { display: "Maldives", code: "maldives" },
    { display: "Mauritania", code: "mauritania" },
    { display: "Mauritius", code: "mauritius" },
    { display: "Mexico", code: "mexico" },
    { display: "Moldova", code: "moldova" },
    { display: "Mongolia", code: "mongolia" },
    { display: "Morocco", code: "morocco" },
    { display: "Mozambique", code: "mozambique" },
    { display: "Namibia", code: "namibia" },
    { display: "Nepal", code: "nepal" },
    { display: "Netherlands", code: "netherlands" },
    { display: "New Caledonia", code: "newcaledonia" },
    { display: "New Zealand", code: "newzealand" },
    { display: "Nicaragua", code: "nicaragua" },
    { display: "Nigeria", code: "nigeria" },
    { display: "North Macedonia", code: "northmacedonia" },
    { display: "Norway", code: "norway" },
    { display: "Oman", code: "oman" },
    { display: "Pakistan", code: "pakistan" },
    { display: "Panama", code: "panama" },
    { display: "Papua New Guinea", code: "papuanewguinea" },
    { display: "Paraguay", code: "paraguay" },
    { display: "Peru", code: "peru" },
    { display: "Philippines", code: "philippines" },
    { display: "Poland", code: "poland" },
    { display: "Portugal", code: "portugal" },
    { display: "Puertorico", code: "puertorico" },
    { display: "Reunion", code: "reunion" },
    { display: "Romania", code: "romania" },
    { display: "Russia", code: "russia" },
    { display: "Rwanda", code: "rwanda" },
    { display: "Saint Kitts and Nevis", code: "saintkittsandnevis" },
    { display: "Saint Lucia", code: "saintlucia" },
    {
      display: "Saint Vincent and the Grenadines",
      code: "saintvincentandgrenadines",
    },
    { display: "Salvador", code: "salvador" },
    { display: "Samoa", code: "samoa" },
    { display: "Saudi Arabia", code: "saudiarabia" },
    { display: "Senegal", code: "senegal" },
    { display: "Serbia", code: "serbia" },
    { display: "Republic of Seychelles", code: "seychelles" },
    { display: "Sierra Leone", code: "sierraleone" },
    { display: "Singapore", code: "singapore" },
    { display: "Slovakia", code: "slovakia" },
    { display: "Slovenia", code: "slovenia" },
    { display: "Solomon Islands", code: "solomonislands" },
    { display: "South Africa", code: "southafrica" },
    { display: "Spain", code: "spain" },
    { display: "Sri Lanka", code: "srilanka" },
    { display: "Suriname", code: "suriname" },
    { display: "Swaziland", code: "swaziland" },
    { display: "Sweden", code: "sweden" },
    { display: "Switzerland", code: "switzerland" },
    { display: "Taiwan", code: "taiwan" },
    { display: "Tajikistan", code: "tajikistan" },
    { display: "Tanzania", code: "tanzania" },
    { display: "Thailand", code: "thailand" },
    { display: "Trinidad and Tobago", code: "tit" },
    { display: "Togo", code: "togo" },
    { display: "Tunisia", code: "tunisia" },
    { display: "Turkmenistan", code: "turkmenistan" },
    { display: "Uganda", code: "uganda" },
    { display: "Ukraine", code: "ukraine" },
    { display: "Uruguay", code: "uruguay" },
    { display: "USA", code: "usa" },
    { display: "Uzbekistan", code: "uzbekistan" },
  ]);
  const [operators, setOperators] = useState<string[]>([
    "any",
    "beeline",
    "tele2",
    "mts",
  ]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [selectedCountry, setSelectedCountry] = useState<string>("any");
  const [selectedOperator, setSelectedOperator] = useState<string>("any");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"rent" | "orders">("rent");
  const [rubleToUSDRate, setRubleToUSDRate] = useState<number>(1);
  const [adjustedBalance, setAdjustedBalance] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [ngnToUSDRate, setNgnToUSDRate] = useState<number>(1);
  const [rentalDuration, setRentalDuration] = useState<string>("1 hour");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lastDeduction, setLastDeduction] = useState<number>(0);
  // Load from localStorage on component mount
  useEffect(() => {
    const savedActiveOrders = localStorage.getItem("activeOrders");
    if (savedActiveOrders) {
      setActiveOrders(JSON.parse(savedActiveOrders));
    }

    const savedDuration = localStorage.getItem("rentalDuration");
    if (savedDuration) setRentalDuration(savedDuration);
  }, []);

  // Save to localStorage when activeOrders changes
  useEffect(() => {
    localStorage.setItem("activeOrders", JSON.stringify(activeOrders));
  }, [activeOrders]);

  // Check for expired orders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setActiveOrders((prevOrders) =>
        prevOrders.filter((order) => {
          const expires = new Date(order.expires);
          return expires > now;
        })
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate price based on duration
  const calculateFinalPrice = (basePrice: number, duration: string) => {
    switch (duration) {
      case "1 hour":
        return basePrice * 1.5; // 50% increase
      case "1 day":
        return basePrice * 2; // 100% increase
      case "1 week":
        return basePrice * 5; // 400% increase (5x)
      default:
        return basePrice;
    }
  };

  // Fetch user balance and email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        setUserEmail(user.email);
        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setBalance(querySnapshot.docs[0].data().amount || 0);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch NGN to USD rate
  const fetchNGNRate = async () => {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/NGN"
      );
      const data = await response.json();
      const rate = Number(data.rates?.USD);
      setNgnToUSDRate(isNaN(rate) ? 1 : rate);
    } catch (err) {
      console.error("Error fetching NGN to USD rate:", err);
      setNgnToUSDRate(1); // Fallback to 1 if API fails
    }
  };

  // Fetch exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/RUB"
        );
        const data = await response.json();
        setRubleToUSDRate(data.rates["USD"] || 1);
      } catch (err) {
        console.error("Error fetching RUB to USD rate:", err);
      }
    };
    fetchRate();
  }, []);

  // Calculate adjusted balance
  useEffect(() => {
    if (orders.length > 0) {
      const totalCost = orders.reduce((sum: number, order: Order) => {
        // Ensure we have valid numbers for calculation
        const orderPrice = Number(order.finalPrice) || 0;
        const rate = Number(rubleToUSDRate) || 1;
        return sum + orderPrice * rate;
      }, 0);
      setAdjustedBalance(Number(balance) - totalCost);
    } else {
      setAdjustedBalance(Number(balance));
    }
  }, [orders, balance, rubleToUSDRate]);

  // Fetch available products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy-rent?action=limits&country=${selectedCountry}&operator=${selectedOperator}`
      );
      const data = await response.json();

      if (response.ok) {
        setProducts(data);
        // Auto-select the first product if none is selected
        if (!selectedProduct && Object.keys(data).length > 0) {
          setSelectedProduct(Object.keys(data)[0]);
        }
      } else {
        setMessage(data.error || "Failed to fetch products");
      }
    } catch (error) {
      setMessage("Network error fetching products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    if (!userEmail) return;

    setLoading(true);
    try {
      const ordersQuery = query(
        collection(db, "rentals"),
        where("user_email", "==", userEmail)
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersData);

      // Update active orders with any new orders that aren't finished/canceled
      const now = new Date();
      const newActiveOrders = ordersData.filter(
        (order) =>
          order.status !== "FINISHED" &&
          order.status !== "CANCELED" &&
          new Date(order.expires) > now
      );
      setActiveOrders((prev) => {
        const existingOrderIds = prev.map((o) => o.order_id);
        const newOrdersToAdd = newActiveOrders.filter(
          (order) => !existingOrderIds.includes(order.order_id)
        );
        return [...prev, ...newOrdersToAdd];
      });
    } catch (error) {
      setMessage("Network error fetching orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Rent a number
  // In rentNumber function, replace the USD conversion check and deduction:
  const rentNumber = async () => {
    if (!selectedProduct) {
      setMessage("Please select a product");
      return;
    }
    if (!userEmail) {
      setMessage("User not authenticated");
      return;
    }

    const basePrice = Number(products[selectedProduct]?.Price) || 0;
    const finalPrice = calculateFinalPrice(basePrice, rentalDuration);

    // Compare the balance directly with the final price (all in USD)
    if (balance < finalPrice) {
      setMessage("Insufficient funds");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/proxy-rent?action=buy&country=${selectedCountry}&operator=${selectedOperator}&product=${selectedProduct}`
      );
      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully rented: ${data.phone}`);

        // Store the exact amount deducted in localStorage
        localStorage.setItem("lastDeduction", finalPrice.toString());
        setLastDeduction(finalPrice);

        // Deduct the cost from user deposit in USD
        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", userEmail)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const depositDoc = querySnapshot.docs[0];
          const currentAmount = Number(depositDoc.data().amount) || 0;
          const newAmount = parseFloat((currentAmount - finalPrice).toFixed(2));
          await updateDoc(depositDoc.ref, { amount: newAmount });
          setBalance(newAmount);
        }

        // Calculate order expiration based on duration
        const now = new Date();
        let expires = new Date(now);
        switch (rentalDuration) {
          case "1 hour":
            expires.setHours(now.getHours() + 1);
            break;
          case "1 day":
            expires.setDate(now.getDate() + 1);
            break;
          case "1 week":
            expires.setDate(now.getDate() + 7);
            break;
          default:
            expires.setHours(now.getHours() + 1);
        }

        // Save the order to Firestore with finalPrice in USD
        const orderData = {
          user_email: userEmail,
          phone: data.phone,
          operator: data.operator,
          product: data.product,
          price: data.price,
          status: data.status,
          expires: expires.toISOString(),
          sms: data.sms || [],
          created_at: new Date().toISOString(),
          country: data.country,
          order_id: data.id.toString(),
          duration: rentalDuration,
          originalPrice: basePrice,
          finalPrice: finalPrice,
        };

        const docRef = await addDoc(collection(db, "rentals"), orderData);
        setActiveOrders((prev) => [...prev, { ...orderData, id: docRef.id }]);
        fetchOrders();
      } else {
        setMessage(data.error || "Failed to rent number");
      }
    } catch (error) {
      setMessage("Network error renting number");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Check order status
  const checkOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy-rent?action=check&orderId=${orderId}`
      );
      const data = await response.json();

      if (response.ok) {
        // Update the order in Firestore with the latest data
        const orderQuery = query(
          collection(db, "rentals"),
          where("order_id", "==", orderId),
          where("user_email", "==", userEmail)
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, {
            status: data.status,
            sms: data.sms || [],
          });
        }

        // Update local state
        setSelectedOrder({
          ...data,
          id: orderId,
          user_email: userEmail || "",
          order_id: orderId,
        });

        // Refresh orders list
        fetchOrders();
      } else {
        setMessage(data.error || "Failed to check order");
      }
    } catch (error) {
      setMessage("Network error checking order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Finish order
  const finishOrder = async (orderId: string) => {
    if (!selectedOrder) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy-rent?action=finish&orderId=${orderId}`
      );
      const data = await response.json();

      if (response.ok) {
        // Update the order in Firestore
        const orderQuery = query(
          collection(db, "rentals"),
          where("order_id", "==", orderId),
          where("user_email", "==", userEmail)
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, {
            status: "FINISHED",
          });
        }

        // Remove from active orders
        setActiveOrders((prev) =>
          prev.filter((order) => order.order_id !== orderId)
        );

        setMessage("Order marked as finished");
        fetchOrders();
        setSelectedOrder(null);
      } else {
        setMessage(data.error || "Failed to finish order");
      }
    } catch (error) {
      setMessage("Network error finishing order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  // In your cancelOrder function, update the refund calculation as follows:
  const cancelOrder = async (orderId: string) => {
    if (!selectedOrder) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy-rent?action=cancel&orderId=${orderId}`
      );
      const data = await response.json();

      if (response.ok) {
        // Update the order in Firestore to CANCELED
        const orderQuery = query(
          collection(db, "rentals"),
          where("order_id", "==", orderId),
          where("user_email", "==", userEmail)
        );
        const orderSnapshot = await getDocs(orderQuery);
        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, { status: "CANCELED" });
        }

        // Get the exact amount to refund from localStorage
        const refundAmount = parseFloat(
          localStorage.getItem("lastDeduction") || "0"
        );

        // Refund the exact amount
        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", userEmail)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const depositDoc = querySnapshot.docs[0];
          const currentAmount = Number(depositDoc.data().amount) || 0;
          const newAmount = parseFloat(
            (currentAmount + refundAmount).toFixed(2)
          );
          await updateDoc(depositDoc.ref, { amount: newAmount });
          setBalance(newAmount);
        }

        // Remove from active orders
        setActiveOrders((prev) =>
          prev.filter((order) => order.order_id !== orderId)
        );

        setMessage(
          `Order canceled and $${refundAmount.toFixed(
            2
          )} refunded to your balance`
        );
        setTimeout(() => setMessage(""), 5000);

        fetchOrders();
        setSelectedOrder(null);
      } else {
        setMessage(data.error || "Failed to cancel order");
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      setMessage("Network error canceling order");
      setTimeout(() => setMessage(""), 5000);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  // Ban number
  const banNumber = async (orderId: string) => {
    if (!selectedOrder) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/proxy-rent?action=ban&orderId=${orderId}`
      );
      const data = await response.json();

      if (response.ok) {
        // Update the order in Firestore
        const orderQuery = query(
          collection(db, "rentals"),
          where("order_id", "==", orderId),
          where("user_email", "==", userEmail)
        );
        const orderSnapshot = await getDocs(orderQuery);

        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(orderDoc.ref, {
            status: "BANNED",
          });
        }

        // Remove from active orders
        setActiveOrders((prev) =>
          prev.filter((order) => order.order_id !== orderId)
        );

        setMessage("Number banned");
        fetchOrders();
        setSelectedOrder(null);
      } else {
        setMessage(data.error || "Failed to ban number");
      }
    } catch (error) {
      setMessage("Network error banning number");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter countries based on search term
  const filteredCountries = countries.filter((country) =>
    country.display.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter products based on search term
  const filteredProducts = Object.keys(products).filter((product) =>
    product.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  );

  // Load products when country/operator changes
  useEffect(() => {
    if (activeTab === "rent") {
      fetchProducts();
    }
  }, [selectedCountry, selectedOperator, activeTab]);

  // Load orders when tab changes or user email changes
  useEffect(() => {
    if (activeTab === "orders" && userEmail) {
      fetchOrders();
    }
  }, [activeTab, userEmail]);

  // Reset current step when tab changes
  useEffect(() => {
    if (activeTab === "rent") {
      setCurrentStep(1);
    }
  }, [activeTab]);

  // Handle country selection
  const handleCountrySelect = (value: string) => {
    setSelectedCountry(value);
    setCurrentStep(2); // Move to next step
  };

  // Handle operator selection
  const handleOperatorSelect = (value: string) => {
    setSelectedOperator(value);
    setCurrentStep(3); // Move to next step
  };

  // Handle product selection
  const handleProductSelect = (value: string) => {
    setSelectedProduct(value);
    setCurrentStep(4); // Move to next step
  };

  // Handle duration selection
  const handleDurationSelect = (value: string) => {
    setRentalDuration(value);
  };

  // Get price for a product based on current duration
  const getProductPrice = (productKey: string) => {
    const basePrice = products[productKey]?.Price || 0;
    return calculateFinalPrice(basePrice, rentalDuration);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Number Rental</h1>
          <p className="mt-2">Temporary numbers for verification</p>

          <div className="mt-4 flex justify-between items-center">
            <div className="bg-blue-700 px-4 py-2 rounded-lg">
              <span className="font-medium">Balance:</span> $
              {parseFloat((balance * ngnToUSDRate).toFixed(2))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("rent")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "rent"
                    ? "bg-white text-blue-800"
                    : "bg-blue-700"
                }`}
              >
                Rent Number
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "orders"
                    ? "bg-white text-blue-800"
                    : "bg-blue-700"
                }`}
              >
                My Orders
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.includes("Success")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {activeTab === "rent" ? (
            <div className="space-y-6">
              {/* Step Guide */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-4">How to rent a number:</h3>
                <div className="flex flex-wrap gap-4">
                  <div
                    className={`flex-1 min-w-[200px] p-3 rounded-lg border ${
                      currentStep >= 1
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          currentStep >= 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        1
                      </div>
                      <h4 className="font-medium">Select Country</h4>
                    </div>
                    {currentStep >= 1 && (
                      <p className="text-sm text-gray-600">
                        Choose the country for your number
                      </p>
                    )}
                  </div>
                  <div
                    className={`flex-1 min-w-[200px] p-3 rounded-lg border ${
                      currentStep >= 2
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          currentStep >= 2
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        2
                      </div>
                      <h4 className="font-medium">Select Operator</h4>
                    </div>
                    {currentStep >= 2 && (
                      <p className="text-sm text-gray-600">
                        Choose the mobile operator
                      </p>
                    )}
                  </div>
                  <div
                    className={`flex-1 min-w-[200px] p-3 rounded-lg border ${
                      currentStep >= 3
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          currentStep >= 3
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        3
                      </div>
                      <h4 className="font-medium">Select Service</h4>
                    </div>
                    {currentStep >= 3 && (
                      <p className="text-sm text-gray-600">
                        Choose the service you need
                      </p>
                    )}
                  </div>
                  <div
                    className={`flex-1 min-w-[200px] p-3 rounded-lg border ${
                      currentStep >= 4
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          currentStep >= 4
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        4
                      </div>
                      <h4 className="font-medium">Select Duration</h4>
                    </div>
                    {currentStep >= 4 && (
                      <p className="text-sm text-gray-600">
                        Choose rental duration
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Selection Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country */}
                <div>
                  <label className="block font-medium mb-2">Country</label>
                  <Select
                    options={countries.map((country) => ({
                      value: country.code,
                      label: country.display,
                    }))}
                    value={{
                      value: selectedCountry,
                      label:
                        countries.find((c) => c.code === selectedCountry)
                          ?.display || "Select Country",
                    }}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        handleCountrySelect(selectedOption.value);
                      }
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isDisabled={loading}
                    placeholder="Select country..."
                  />
                </div>

                {/* Operator */}
                <div>
                  <label className="block font-medium mb-2">Operator</label>
                  <Select
                    options={operators.map((operator) => ({
                      value: operator,
                      label:
                        operator.charAt(0).toUpperCase() + operator.slice(1),
                    }))}
                    value={{
                      value: selectedOperator,
                      label:
                        selectedOperator.charAt(0).toUpperCase() +
                        selectedOperator.slice(1),
                    }}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        handleOperatorSelect(selectedOption.value);
                      }
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isDisabled={loading || currentStep < 2}
                    placeholder="Select operator..."
                  />
                </div>

                {/* Service */}
                <div>
                  <label className="block font-medium mb-2">Service</label>
                  <Select
                    options={Object.keys(products).map((product) => ({
                      value: product,
                      label: `${product} ($${getProductPrice(product).toFixed(
                        2
                      )})`,
                    }))}
                    value={
                      selectedProduct
                        ? {
                            value: selectedProduct,
                            label: `${selectedProduct} ($${getProductPrice(
                              selectedProduct
                            ).toFixed(2)})`,
                          }
                        : null
                    }
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        handleProductSelect(selectedOption.value);
                      }
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isDisabled={
                      loading ||
                      currentStep < 3 ||
                      !Object.keys(products).length
                    }
                    placeholder={
                      Object.keys(products).length
                        ? "Select service..."
                        : "No services available"
                    }
                  />
                </div>
              </div>

              {/* Duration selection with price calculation */}
              {currentStep >= 4 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="font-medium block mb-2">
                    Rental Duration:
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {["1 hour", "1 day", "1 week"].map((duration) => (
                      <div key={duration} className="flex items-center">
                        <input
                          type="radio"
                          id={duration}
                          name="duration"
                          value={duration}
                          checked={rentalDuration === duration}
                          onChange={() => handleDurationSelect(duration)}
                          className="mr-2"
                        />
                        <label htmlFor={duration} className="flex items-center">
                          {duration}
                          {selectedProduct && (
                            <span className="ml-2 text-blue-600 font-medium">
                              ($
                              {calculateFinalPrice(
                                products[selectedProduct]?.Price || 0,
                                duration
                              ).toFixed(2)}
                              )
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Info */}
              {selectedProduct && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FiInfo className="text-blue-600" />
                    <span className="font-medium">Available Numbers:</span>
                    <span>{products[selectedProduct]?.Qty || 0}</span>
                  </div>

                  <div className="mt-2">
                    <span className="font-medium">
                      Total Price ({rentalDuration}):
                    </span>{" "}
                    $
                    {calculateFinalPrice(
                      products[selectedProduct]?.Price || 0,
                      rentalDuration
                    ).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Rent Button */}
              {currentStep >= 4 && (
                <div className="flex justify-center">
                  <button
                    onClick={rentNumber}
                    disabled={loading || !selectedProduct}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Rent Number Now"
                    )}
                  </button>
                </div>
              )}

              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4">Active Rentals</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {activeOrders.map((order) => (
                      <div
                        key={order.id}
                        className="mb-4 last:mb-0 border-b pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{order.phone}</p>
                            <p className="text-sm text-gray-600">
                              {order.product} • Expires:{" "}
                              {new Date(order.expires).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => cancelOrder(order.order_id)}
                            className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">My Orders</h2>
              {/* // Update the orders display section in the "My Orders" tab */}
              {activeTab === "orders" && orders.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    Total Orders Cost: $
                    {orders
                      .reduce((sum, order) => {
                        const orderPrice = Number(order.finalPrice) || 0;
                        const rate = Number(rubleToUSDRate) || 1;
                        return sum + orderPrice * rate;
                      }, 0)
                      .toFixed(2)}
                  </p>
                  <p className="font-medium">
                    Available Balance: $ {Number(adjustedBalance).toFixed(2)}
                  </p>
                </div>
              )}
              {selectedOrder ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">
                      Order #{selectedOrder.order_id}
                    </h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Back to list
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedOrder.phone}
                      </p>
                      <p>
                        <span className="font-medium">Country:</span>{" "}
                        {selectedOrder.country}
                      </p>
                      <p>
                        <span className="font-medium">Operator:</span>{" "}
                        {selectedOrder.operator}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Service:</span>{" "}
                        {selectedOrder.product}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        {selectedOrder.status}
                      </p>
                      <p>
                        <span className="font-medium">Expires:</span>{" "}
                        {new Date(selectedOrder.expires).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* SMS Messages */}
                  {selectedOrder.sms?.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Received SMS:</h4>
                      <div className="space-y-2">
                        {selectedOrder.sms.map((sms, index) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded border"
                          >
                            <p>
                              <span className="font-medium">From:</span>{" "}
                              {sms.sender}
                            </p>
                            <p>
                              <span className="font-medium">Time:</span>{" "}
                              {new Date(sms.date).toLocaleString()}
                            </p>
                            <p className="mt-2">{sms.text}</p>
                            {sms.code && (
                              <p className="mt-1 font-bold">Code: {sms.code}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No SMS messages received yet
                    </p>
                  )}

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => checkOrder(selectedOrder.order_id)}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => finishOrder(selectedOrder.order_id)}
                      disabled={selectedOrder.status === "FINISHED"}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      Finish
                    </button>
                    <button
                      onClick={() => cancelOrder(selectedOrder.order_id)}
                      disabled={selectedOrder.status === "CANCELED"}
                      className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => banNumber(selectedOrder.order_id)}
                      disabled={selectedOrder.status === "BANNED"}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 disabled:opacity-50"
                    >
                      Ban
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-4 border">Phone</th>
                            <th className="py-2 px-4 border">Service</th>
                            <th className="py-2 px-4 border">Status</th>
                            <th className="py-2 px-4 border">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="py-2 px-4 border text-center">
                                {order.phone}
                              </td>
                              <td className="py-2 px-4 border text-center">
                                {order.product}
                              </td>
                              <td className="py-2 px-4 border text-center">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    order.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.status === "FINISHED"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "CANCELED"
                                      ? "bg-gray-100 text-gray-800"
                                      : order.status === "BANNED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-2 px-4 border text-center">
                                <button
                                  onClick={() => checkOrder(order.order_id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {loading ? (
                        <div className="flex justify-center">
                          <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
                        </div>
                      ) : (
                        "You haven't rented any numbers yet"
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentNumbers;
