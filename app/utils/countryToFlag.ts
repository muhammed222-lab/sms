export const countryToFlag = (isoCode: string) => {
  if (!isoCode) return "🌐"; // Default globe emoji if no code provided

  // Convert country code to flag emoji
  return typeof String.fromCodePoint !== "undefined"
    ? isoCode
        .toUpperCase()
        .replace(/./g, (char) =>
          String.fromCodePoint(127397 + char.charCodeAt(0))
        )
    : isoCode; // Fallback to country code if fromCodePoint not available
};

export const getServiceIcon = (service: string) => {
  // You can expand this with more service-specific icons
  switch (service.toLowerCase()) {
    case "whatsapp":
      return "📱"; // Replace JSX with plain string
    case "telegram":
      return "✈️"; // Replace JSX with plain string
    case "facebook":
      return "f"; // Replace JSX with plain string
    case "google":
      return "G"; // Replace JSX with plain string
    case "twitter":
      return "𝕏"; // Replace JSX with plain string
    default:
      return "📞"; // Replace JSX with plain string
  }
};
