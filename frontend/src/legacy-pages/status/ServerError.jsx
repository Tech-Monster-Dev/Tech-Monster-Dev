import { ServerCrash } from "lucide-react";
import StatusPage from "../../components/StatusPage/StatusPage";

export default function ServerError() {
  return (
    <StatusPage
      code="500"
      title="Internal Server Error"
      description="Something went wrong on our server. Please try again later."
      Icon={ServerCrash}
      primaryText="Retry"
      primaryPath="/"
    />
  );
}