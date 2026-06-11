import AdminDashboard from "@/components/AdminDashboard";
import { AppProvider } from "@/context/AppContext";
import { MoodProvider } from "@/context/MoodProvider";
import AuthGate from "@/components/AuthGate";

export function meta() {
  return [{ name: "robots", content: "noindex, nofollow" }];
}

export default function DashboardPage() {
  return (
    <AppProvider>
      <MoodProvider>
        <AuthGate>
          <AdminDashboard />
        </AuthGate>
      </MoodProvider>
    </AppProvider>
  );
}
