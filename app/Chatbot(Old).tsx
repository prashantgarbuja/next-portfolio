import React, { useEffect } from "react";

const Chatbot: React.FC = () => {
  useEffect(() => {
    const loadScripts = async () => {
      const script1 = document.createElement("script");
      script1.src = "https://cdn.botpress.cloud/webchat/v2.2/inject.js";
      script1.async = true;

      script1.onload = () => {
        const script2 = document.createElement("script");
        script2.src =
          "https://files.bpcontent.cloud/2025/01/14/04/20250114045321-ZIV09OPB.js";
        script2.async = true;

        script2.onload = () => {
          if ((window as any).botpressWebChat) {
            (window as any).botpressWebChat.init({
              showMinimizeButton: true,
            });
          }
        };

        document.body.appendChild(script2);
      };

      document.body.appendChild(script1);
    };

    loadScripts();

    // Cleanup on unmount
    return () => {
      document.querySelectorAll("script[src*='botpress']").forEach((script) => {
        document.body.removeChild(script);
      });

      if ((window as any).botpressWebChat) {
        (window as any).botpressWebChat.close();
      }
    };
  }, []);

  return null;
};

export default Chatbot;
