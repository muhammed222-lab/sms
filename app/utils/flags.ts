// utils/flags.ts
export const getCountryFlagEmoji = (countryCode: string) => {
  // Convert country name to ISO code if needed
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
