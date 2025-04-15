import Header from "@/app/components/header";
import Settings from "@/app/components/Settings";
import React from "react";

const page = () => {
  return (
    <>
      <Header />
      <div className="mt-5">
        <Settings />
      </div>
    </>
  );
};

export default page;
