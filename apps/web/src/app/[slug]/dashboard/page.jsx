import MohamedDashboard from "@/components/MohamedDashboard";
import { AppProvider } from "@/context/AppContext";

export default function DashboardPage() {
  return (
    <AppProvider>
      <MohamedDashboard />
    </AppProvider>
  );
}
