import { ShieldX } from "lucide-react";
import StatusPage from "../../components/StatusPage/StatusPage";

export default function Unauthorized() {
  return (
    <StatusPage
      code="403"
      title="Access Denied"
      description="You don't have permission to access this page."
      Icon={ShieldX}
      primaryText="Dashboard"
      primaryPath="/"
    />
  );
}