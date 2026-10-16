import { Ban } from "lucide-react";
import StatusPage from "../../components/StatusPage/StatusPage";

export default function AccountBlocked() {
  return (
    <StatusPage
      code="403"
      title="Account Blocked"
      description="Your account has been blocked. Please contact support."
      Icon={Ban}
      primaryText="Contact Support"
      primaryPath="/contact"
    />
  );
}
