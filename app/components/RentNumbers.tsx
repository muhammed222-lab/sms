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
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

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
}

interface SMS {
  created_at: string;
  date: string;
  sender: string;
  text: string;
  code: string;
}

const RentNumbers: React.FC = () => {
  // Replace the current countries state with an array of objects containing both display and API code values.
  const [countries, setCountries] = useState<
    { display: string; code: string }[]
  >([
    { display: "Any", code: "any" },
    { display: "Afghanistan", code: "afghanistan" },
    { display: "Albania", code: "albania" },
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
    { display: "Venezuela", code: "venezuela" },
    { display: "Vietnam", code: "vietnam" },
    { display: "Zambia", code: "zambia" },
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
  const [selectedProduct, setSelectedProduct] = useState<string>("telegram");
  const [orders, setOrders] = useState<Order[]>([]);
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

  useEffect(() => {
    // Load rental duration from localStorage
    const savedDuration = localStorage.getItem("rentalDuration");
    if (savedDuration) setRentalDuration(savedDuration);
  }, []);

  useEffect(() => {
    // Save rental duration to localStorage when changed
    localStorage.setItem("rentalDuration", rentalDuration);
  }, [rentalDuration]);

  // Fetch NGN to USD rate
  useEffect(() => {
    const fetchNGNRate = async () => {
      try {
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/NGN"
        );
        const data = await response.json();
        setNgnToUSDRate(data.rates["USD"] || 1);
      } catch (err) {
        console.error("Error fetching NGN to USD rate:", err);
      }
    };
    fetchNGNRate();
  }, []);

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
        return sum + order.price * rubleToUSDRate;
      }, 0);
      setAdjustedBalance(balance - totalCost);
    } else {
      setAdjustedBalance(balance);
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
    } catch (error) {
      setMessage("Network error fetching orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Rent a number
  const rentNumber = async () => {
    if (!selectedProduct) {
      setMessage("Please select a product");
      return;
    }
    if (!userEmail) {
      setMessage("User not authenticated");
      return;
    }

    // Calculate cost: API price (₽) converted to USD then tripled
    const orderCostUSD = products[selectedProduct].Price * rubleToUSDRate * 3;
    const depositUSD = balance * ngnToUSDRate;
    if (depositUSD < orderCostUSD) {
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

        // Deduct the cost from user deposit (in NGN)
        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", userEmail)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const depositDoc = querySnapshot.docs[0];
          const currentAmount = depositDoc.data().amount || 0; // in NGN
          const costNGN = orderCostUSD / ngnToUSDRate; // convert cost USD back to NGN
          const newAmount = currentAmount - costNGN;
          const depositRef = depositDoc.ref;
          await updateDoc(depositRef, { amount: newAmount });
          setBalance(newAmount);
        }

        // Save the order to Firestore "rentals" collection (add rentalDuration if desired)
        const orderData = {
          user_email: userEmail,
          phone: data.phone,
          operator: data.operator,
          product: data.product,
          price: data.price, // stored in ₽
          status: data.status,
          expires: data.expires,
          sms: data.sms || [],
          created_at: data.created_at,
          country: data.country,
          order_id: data.id.toString(),
          rentalDuration, // store chosen duration if needed
        };
        await addDoc(collection(db, "rentals"), orderData);

        // Refresh orders list
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

        // Refund: recalc cost for this order (triple the cost in USD) and refund in NGN
        const refundCostUSD = selectedOrder.price * rubleToUSDRate * 3;
        const refundNGN = refundCostUSD / ngnToUSDRate;
        // Update user deposit by adding refund
        const q = query(
          collection(db, "userDeposits"),
          where("email", "==", userEmail)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const depositDoc = querySnapshot.docs[0];
          const currentAmount = depositDoc.data().amount || 0;
          const newAmount = currentAmount + refundNGN;
          await updateDoc(depositDoc.ref, { amount: newAmount });
          setBalance(newAmount);
        }

        setMessage("Order canceled and amount refunded");
        fetchOrders();
        setSelectedOrder(null);
      } else {
        setMessage(data.error || "Failed to cancel order");
      }
    } catch (error) {
      setMessage("Network error canceling order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
  useEffect(() => {
    // Final cost for each order: (order.price in ₽ * rubleToUSDRate) * 3
    const totalCostUSD = orders.reduce((sum: number, order: Order) => {
      return sum + order.price * rubleToUSDRate * 3;
    }, 0);
    setAdjustedBalance(balance * ngnToUSDRate - totalCostUSD);
  }, [orders, balance, rubleToUSDRate, ngnToUSDRate]);
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
              {(balance * ngnToUSDRate).toFixed(2)}
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
              {/* Selection Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country */}
                <div>
                  <label className="block font-medium mb-2">Country</label>
                  {/* // In your JSX render in RentNumbers.tsx */}
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    disabled={loading}
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.display}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operator */}
                <div>
                  <label className="block font-medium mb-2">Operator</label>
                  <select
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    disabled={loading}
                  >
                    {operators.map((operator) => (
                      <option key={operator} value={operator}>
                        {operator.charAt(0).toUpperCase() + operator.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product */}
                <div>
                  <label className="block font-medium mb-2">Service</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    disabled={loading || !Object.keys(products).length}
                  >
                    {Object.keys(products).length ? (
                      Object.keys(products).map((product) => (
                        <option key={product} value={product}>
                          {product} (${products[product].Price})
                        </option>
                      ))
                    ) : (
                      <option value="">No products available</option>
                    )}
                  </select>
                </div>
              </div>
              {/* the duration selection */}
              <label className="font-medium">Rental Duration:</label>
              <select
                value={rentalDuration}
                onChange={(e) => setRentalDuration(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="1 hour">1 hour</option>
                <option value="1 day">1 day</option>
                <option value="1 week">1 week</option>
              </select>
              {/* Product Info */}
              {Object.keys(products).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FiInfo className="text-blue-600" />
                    <span className="font-medium">Available Numbers:</span>
                    <span>{products[selectedProduct]?.Qty || 0}</span>
                  </div>
                </div>
              )}

              {/* Rent Button */}
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
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">My Orders</h2>

              {activeTab === "orders" && orders.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    Total Orders Cost: $
                    {orders
                      .reduce(
                        (sum, order) => sum + order.price * rubleToUSDRate * 3,
                        0
                      )
                      .toFixed(2)}
                  </p>
                  <p className="font-medium">
                    Available Balance: ${adjustedBalance.toFixed(2)}
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
