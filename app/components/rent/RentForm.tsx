/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/rent/RentForm.tsx
import React, { useState, useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiInfo } from "react-icons/fi";
import CountrySelector from "./CountrySelector";
import OperatorSelector from "./OperatorSelector";
import ProductSelector from "./ProductSelector";
import { DurationSelector } from "./DurationSelector";
import ActiveOrders from "./ActiveOrders";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

interface RentFormProps {
  userEmail: string | null;
  balance: number;
  rubleToUSDRate: number;
  setMessage: (message: string) => void;
  setBalance: (balance: number) => void;
  setActiveOrders: (orders: any[]) => void;
  fetchOrders: () => void;
}

const RentForm: React.FC<RentFormProps> = ({
  userEmail,
  balance,
  rubleToUSDRate,
  setMessage,
  setBalance,
  setActiveOrders,
  fetchOrders,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("any");
  const [selectedOperator, setSelectedOperator] = useState<string>("any");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [rentalDuration, setRentalDuration] = useState<string>("1 hour");
  const [products, setProducts] = useState<Record<string, any>>({});
  const [activeOrders, setLocalActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Load from localStorage on component mount
  useEffect(() => {
    const savedActiveOrders = localStorage.getItem("activeOrders");
    if (savedActiveOrders) {
      setLocalActiveOrders(JSON.parse(savedActiveOrders));
    }

    const savedDuration = localStorage.getItem("rentalDuration");
    if (savedDuration) setRentalDuration(savedDuration);
  }, []);

  // Save to localStorage when activeOrders changes
  useEffect(() => {
    localStorage.setItem("activeOrders", JSON.stringify(activeOrders));
    setActiveOrders(activeOrders);
  }, [activeOrders]);

  // Calculate price based on duration
  const calculateFinalPrice = (basePrice: number, duration: string) => {
    switch (duration) {
      case "1 hour":
        return basePrice * 1.5;
      case "1 day":
        return basePrice * 2;
      case "1 week":
        return basePrice * 5;
      default:
        return basePrice;
    }
  };

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

  // Load products when country/operator changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCountry, selectedOperator]);

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

    const basePrice = Number(products[selectedProduct]?.Price) || 0;
    const finalPrice = calculateFinalPrice(basePrice, rentalDuration);

    // Compare the balance directly with the final price (all in USD)
    if (balance < finalPrice) {
      setMessage("Insufficient balance");
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
        setLocalActiveOrders((prev) => [
          ...prev,
          { ...orderData, id: docRef.id },
        ]);
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

  // Cancel order
  const cancelOrder = async (orderId: string) => {
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
        setLocalActiveOrders((prev) =>
          prev.filter((order) => order.order_id !== orderId)
        );

        setMessage(
          `Order canceled and $${refundAmount.toFixed(
            2
          )} refunded to your balance`
        );
        setTimeout(() => setMessage(""), 5000);

        fetchOrders();
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

  return (
    <div className="space-y-6">
      {/* Step Guide */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-4">How to rent a number:</h3>
        <div className="flex flex-wrap gap-4">
          {/* Step indicators */}
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 min-w-[200px] p-3 rounded-lg border ${
                currentStep >= step
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center mb-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                    currentStep >= step
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {step}
                </div>
                <h4 className="font-medium">
                  {step === 1 && "Select Country"}
                  {step === 2 && "Select Operator"}
                  {step === 3 && "Select Service"}
                  {step === 4 && "Select Duration"}
                </h4>
              </div>
              {currentStep >= step && (
                <p className="text-sm text-gray-600">
                  {step === 1 && "Choose the country for your number"}
                  {step === 2 && "Choose the mobile operator"}
                  {step === 3 && "Choose the service you need"}
                  {step === 4 && "Choose rental duration"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selection Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CountrySelector
          selectedCountry={selectedCountry}
          setSelectedCountry={(value) => {
            setSelectedCountry(value);
            setCurrentStep(2);
          }}
          disabled={loading}
          setCurrentStep={function (step: number): void {
            throw new Error("Function not implemented.");
          }}
        />

        <OperatorSelector
          selectedOperator={selectedOperator}
          setSelectedOperator={(value) => {
            setSelectedOperator(value);
            setCurrentStep(3);
          }}
          disabled={loading || currentStep < 2}
          setCurrentStep={function (step: number): void {
            throw new Error("Function not implemented.");
          }}
        />

        <ProductSelector
          selectedProduct={selectedProduct}
          setSelectedProduct={(value) => {
            setSelectedProduct(value);
            setCurrentStep(4);
          }}
          products={products}
          rentalDuration={rentalDuration}
          disabled={loading || currentStep < 3 || !Object.keys(products).length}
        />
      </div>

      {/* Duration selection */}
      {currentStep >= 4 && (
        <DurationSelector
          rentalDuration={rentalDuration}
          setRentalDuration={setRentalDuration}
          selectedProduct={selectedProduct}
          products={products}
        />
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
            <span className="font-medium">Total Price ({rentalDuration}):</span>{" "}
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
      <ActiveOrders activeOrders={activeOrders} onCancelOrder={cancelOrder} />
    </div>
  );
};

export default RentForm;
