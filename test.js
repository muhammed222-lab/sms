const saveUserToDb = async () => {
  try {
    const response = await fetch("/api/saveUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: 0, // Default balance
        generatedNumber: "", // Default generated number
      }),
    });

    if (response.ok) {
      console.log("User saved to the database.");
    } else {
      const data = await response.json();
      console.error("Error saving user data:", data.message);
    }
  } catch (error) {
    console.error("Error saving user data to DB:", error);
  }
};
