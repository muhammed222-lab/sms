export const getServiceLogoUrl = (serviceName: string) => {
  return `https://logo.clearbit.com/${serviceName}.com`;
};

export const calculatePriceInUSD = (
  rubPrice: number,
  rubToUsdRate: number | null
): string => {
  if (!rubToUsdRate) return "Loading...";
  // Calculate exact price without doubling
  const priceUsd = rubPrice * rubToUsdRate;
  return `$${priceUsd.toFixed(2)} USD`;
};

export const getCountdown = (expires: string) => {
  const diff = new Date(expires).getTime() - Date.now();
  if (diff <= 0) return "00:00";
  const minutes = Math.floor(diff / 60000)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((diff % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};
