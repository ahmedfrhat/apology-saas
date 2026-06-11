import AdminDashboard from "@/components/AdminDashboard";
import { AppProvider } from "@/context/AppContext";

export function meta() {
  return [{ name: "robots", content: "noindex, nofollow" }];
}

import AuthGate from "@/components/AuthGate";

export default function DashboardPage() {
  return (
    <AppProvider>
      <AuthGate>
        <AdminDashboard />
      </AuthGate>
    </AppProvider>
  );
}
