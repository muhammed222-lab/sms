# Deemax

Deemax is a modern web application that offers temporary number rentals for verification purposes, secure bank account verification, and a robust referral program. Built with Next.js and React, Deemax leverages Firebase for authentication and Firestore for data management while integrating with external services such as Flutterwave APIs.

## Features

- **Temporary Number Rental:**  
  Rent numbers for verification with dynamic pricing based on rental duration.  
  Manage your orders with options to finish, cancel, or ban a rental.

- **Secure Bank Verification:**  
  Verify bank account details with real-time lookup using the Flutterwave API.  
  Display bank logos using custom JSON data from `public/bank-icon.json` (fallback to a bank emoji if no logo is found).

- **Referral System:**  
  Earn commission from referrals and check your earnings through a dedicated dashboard.

- **Responsive and Interactive UI:**  
  Built using Tailwind CSS and Framer Motion for smooth animations and an adaptive layout.  
  Dynamic forms with React Select for bank selection and other dropdowns.

## Technologies

- **Frameworks & Libraries:**  
  Next.js, React, Tailwind CSS, Framer Motion, React Select

- **Backend & Database:**  
  Firebase (Authentication, Firestore)  
  Next.js API Routes

- **Third-Party APIs:**  
  Flutterwave for bank and payment services  
  Exchange Rate APIs for real-time pricing adjustments

## How It Works

- **Rent Numbers:**  
  Users select a country, operator, service, and duration using a guided multi-step form.  
  Price calculations update in real time and the user’s balance (stored in USD) is immediately deducted upon a successful rental.  
  Canceling an order refunds the exact deducted amount.

- **Bank Account Verification:**  
  Users select their bank from a searchable list that uses React Select.  
  Bank logos are displayed using data from `public/bank-icon.json`; if a logo is not available, a default bank emoji is shown.  
  When both a bank and an account number are provided, the "Verify Account" button becomes active.

- **Referral Dashboard:**  
  Displays total commission earned.  
  Provides an interface for bank selection and account verification for withdrawal purposes.

## Customization

- **UI Components:**  
  Components such as `RentNumbers.tsx` and `Refer.tsx` in the `app/components` folder are modular and can be easily modified.

- **API Routes:**  
  Proxy endpoints in the `app/api` directory are used to fetch data from external APIs (e.g., Flutterwave for bank details).

- **Styling:**  
  The project utilizes Tailwind CSS throughout. Customize the design via the `tailwind.config.js` file and utility classes in your components.

## Contributing

Contributions are welcome. Feel free to open an issue or submit a pull request with enhancements or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE).

