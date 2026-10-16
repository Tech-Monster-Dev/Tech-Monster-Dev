import { Clock3 } from "lucide-react";
import StatusPage from "../../components/StatusPage/StatusPage";

export default function SessionExpired() {
  return (
    <StatusPage
      code="440"
      title="Session Expired"
      description="Your session has expired. Please login again."
      Icon={Clock3}
      primaryText="Login Again"
      primaryPath="/auth/login"
    />
  );
}
