// "use client";

// import React, { useState, useEffect, createContext, useContext } from "react";

// // Create a context to manage the theme state
// const ThemeContext = createContext({
//   theme: "system",
//   setTheme: (theme: string) => {},
// });

// interface ThemeProviderProps {
//   children: React.ReactNode;
// }

// export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
//   const [theme, setTheme] = useState("system");

//   useEffect(() => {
//     const root = window.document.documentElement;
//     const initialTheme = localStorage.getItem("theme") || "system";
//     setTheme(initialTheme);

//     if (
//       initialTheme === "dark" ||
//       (initialTheme === "system" &&
//         window.matchMedia("(prefers-color-scheme: dark)").matches)
//     ) {
//       root.classList.add("dark");
//     } else {
//       root.classList.remove("dark");
//     }
//   }, []);

//   useEffect(() => {
//     const root = window.document.documentElement;
//     localStorage.setItem("theme", theme);

//     if (
//       theme === "dark" ||
//       (theme === "system" &&
//         window.matchMedia("(prefers-color-scheme: dark)").matches)
//     ) {
//       root.classList.add("dark");
//     } else {
//       root.classList.remove("dark");
//     }
//   }, [theme]);

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// const Mode = () => {
//   const { theme, setTheme } = useContext(ThemeContext);

//   const toggleTheme = () => {
//     if (theme === "light") {
//       setTheme("dark");
//     } else if (theme === "dark") {
//       setTheme("system");
//     } else {
//       setTheme("light");
//     }
//   };

//   return (
//     <div>
//       {/* <button
//         onClick={toggleTheme}
//         className="p-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded"
//       >
//         Toggle Theme (Current: {theme})
//       </button> */}
//     </div>
//   );
// };

// export default Mode;
import React from "react";

const Mode = () => {
  return <div></div>;
};

export default Mode;
