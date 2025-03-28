// utils/currency.ts
export const convertRubToUsd = async (amountInRub: number): Promise<number> => {
  try {
    // You can use a free currency API like exchangerate-api.com
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/RUB"
    );
    const data = await response.json();
    const rate = data.rates.USD;
    return amountInRub * rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    // Fallback rate if API fails (you might want to update this periodically)
    return amountInRub * 0.011; // Approximate rate as of 2023
  }
};
