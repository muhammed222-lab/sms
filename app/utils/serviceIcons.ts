// utils/serviceIcons.ts
export const getServiceIcon = (serviceName: string) => {
  const serviceIcons: Record<string, string> = {
    telegram: "https://telegram.org/img/t_logo.png",
    whatsapp:
      "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    facebook:
      "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    google:
      "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
    twitter:
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg",
    // Add more services as needed
  };

  const normalizedService = serviceName.toLowerCase();
  return serviceIcons[normalizedService] || "https://via.placeholder.com/24";
};
