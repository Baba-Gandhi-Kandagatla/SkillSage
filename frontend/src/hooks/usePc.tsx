import { useState, useEffect } from "react";

export const usePc = () => {
  const [isPc, setIsPc] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => {
      setIsPc(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isPc;
};