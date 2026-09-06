import { WifiOff } from "lucide-react";
import StatusPage from "../../components/StatusPage/StatusPage";

export default function Offline() {
  return (
    <StatusPage
      code="000"
      title="You're Offline"
      description="Please check your internet connection and try again."
      Icon={WifiOff}
      showActions={false}
    />
  );
}