import { NextResponse } from "next/server";
import { db } from "../../firebaseConfig";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.CRYPTOMUS_API_KEY;

export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    console.log("Callback received:", reqBody);
    const { sign, uuid, status, amount, currency, payer_email } = reqBody;

    if (!sign || !uuid || !status || !amount || !currency || !payer_email) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Verify the signature
    const data = { uuid, status, amount, currency, payer_email };
    const dataBase64 = Buffer.from(JSON.stringify(data)).toString("base64");
    const hash = crypto
      .createHash("md5")
      .update(dataBase64 + API_KEY)
      .digest("hex");

    if (hash !== sign) {
      return NextResponse.json({ error: "Invalid sign." }, { status: 400 });
    }

    // Handle successful payment
    if (status === "paid" || status === "paid_over") {
      try {
        // Fetch the exchange rate to convert the amount to Naira
        const response = await axios.get(
          `https://api.exchangerate-api.com/v4/latest/${currency}`
        );
        const exchangeRate = response.data.rates.NGN;
        const amountInNaira = amount * exchangeRate;

        // Update the user's balance in the userDeposits collection
        const userRef = collection(db, "userDeposits");
        const userDocSnap = await getDoc(doc(userRef, payer_email));

        if (userDocSnap.exists()) {
          const currentBalance = userDocSnap.data().amount || 0;
          const newBalance = currentBalance + amountInNaira;
          await updateDoc(doc(userRef, payer_email), {
            amount: newBalance,
            date: new Date().toISOString(),
          });
        } else {
          await addDoc(userRef, {
            email: payer_email,
            amount: amountInNaira,
            date: new Date().toISOString(),
          });
        }

        return NextResponse.json({ success: true }, { status: 200 });
      } catch (error) {
        console.error("Error updating user balance:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch {
    // No parameter is needed here
    return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
  }
}
