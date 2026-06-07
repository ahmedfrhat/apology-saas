import AdminDashboard from "@/components/AdminDashboard";
import { AppProvider } from "@/context/AppContext";

export default function DashboardPage() {
  return (
    <AppProvider>
      <AdminDashboard />
    </AppProvider>
  );
}
