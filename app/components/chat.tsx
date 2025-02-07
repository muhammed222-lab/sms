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
      <div className="chat-container">
        {!isLoaded && <div className="loading">Loading chat...</div>}
      </div>
      <style jsx>{`
        .chat-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 99999;
        }
        .loading {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Mobile responsiveness */
        @media (max-width: 600px) {
          .chat-container {
            bottom: 10px;
            right: 10px;
            width: calc(100vw - 20px);
            height: calc(100vh - 20px);
            border-radius: 0;
          }
        }
      `}</style>
    </>
  );
};

export default Chat;
