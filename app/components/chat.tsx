"use client";
import React, { useEffect, useState } from "react";

// Type definition for MomentCRM
declare global {
  interface Window {
    MomentCRM: (
      command: string,
      options: {
        teamVanityId: string;
        doChat: boolean;
        doTimeTravel: boolean;
        quadClickForFeedback: boolean;
      }
    ) => void;
  }
}

const Chat = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if script is already loaded
    if (
      document.querySelector('script[src="https://www.momentcrm.com/embed"]')
    ) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.momentcrm.com/embed";
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
      if (window.MomentCRM) {
        window.MomentCRM("init", {
          teamVanityId: "smsglobe-team",
          doChat: true,
          doTimeTravel: true,
          quadClickForFeedback: true,
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://www.momentcrm.com/embed"]'
      );
      if (existingScript?.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <>
      {/* 
        Adding pointerEvents: "none" here prevents the chat container 
        from intercepting clicks meant for underlying elements.
      */}
      <div className="chat-container" style={{ pointerEvents: "none" }}>
        {!isLoaded && <div className="loading">Loading chat...</div>}
      </div>
    </>
  );
};

export default Chat;
