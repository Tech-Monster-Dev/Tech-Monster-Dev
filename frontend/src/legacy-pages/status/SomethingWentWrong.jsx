import { TriangleAlert } from "lucide-react";
import StatusPage from "../../components/StatusPage/StatusPage";

export default function SomethingWentWrong() {
  return (
    <StatusPage
      code="500"
      title="Something Went Wrong"
      description="An unexpected error occurred. Please try again."
      Icon={TriangleAlert}
      primaryText="Try Again"
      primaryPath="/"
      onPrimaryClick={() => window.location.reload()}
    />
  );
}