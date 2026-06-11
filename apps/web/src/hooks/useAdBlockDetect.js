import { useState, useEffect } from "react";

export function useAdBlockDetect() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  useEffect(() => {
    // 1. Try fetching a known ad domain
    const checkAdBlock = async () => {
      let isBlocked = false;
      try {
        await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
        });
      } catch (error) {
        isBlocked = true;
      }

      // 2. Fallback check for hidden elements
      if (!isBlocked) {
        const testAd = document.createElement("div");
        testAd.innerHTML = "&nbsp;";
        testAd.className = "adsbox ad-placement doubleclick ad-placeholder ad-badge";
        document.body.appendChild(testAd);

        // Wait a frame to let adblocker do its thing
        await new Promise((r) => setTimeout(r, 100));

        if (testAd.offsetHeight === 0 || testAd.style.display === "none") {
          isBlocked = true;
        }
        testAd.remove();
      }

      setAdBlockDetected(isBlocked);
    };

    // Delay the check slightly so it doesn't block main thread loading
    const timer = setTimeout(() => {
      checkAdBlock();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return adBlockDetected;
}
