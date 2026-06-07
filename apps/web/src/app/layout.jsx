import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        dir="rtl"
        className="font-cairo antialiased bg-[#F4F3EF] text-[#1A1A1A] min-h-screen"
      >
        {children}
      </div>
    </QueryClientProvider>
  );
}
