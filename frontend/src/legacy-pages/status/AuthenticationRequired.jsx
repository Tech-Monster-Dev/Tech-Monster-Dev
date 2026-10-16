import { LockKeyhole } from "lucide-react";
import StatusPage from "../../components/StatusPage/StatusPage";

export default function AuthenticationRequired() {
  return (
    <StatusPage
      code="401"
      title="Authentication Required"
      description="Please login to access this page."
      Icon={LockKeyhole}
      primaryText="Login"
      primaryPath="/auth/login"
    />
  );
}
