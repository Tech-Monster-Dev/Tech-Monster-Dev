import { TimerReset } from "lucide-react";
import StatusPage from "../../components/StatusPage/StatusPage";

export default function TooManyRequests() {
  return (
    <StatusPage
      code="429"
      title="Too Many Requests"
      description="You have sent too many requests. Please wait and try again."
      Icon={TimerReset}
      primaryText="Retry"
      primaryPath="/"
    />
  );
}