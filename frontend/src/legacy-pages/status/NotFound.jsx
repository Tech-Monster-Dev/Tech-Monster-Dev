import { SearchX } from "lucide-react";
import StatusPage from "../../components/StatusPage/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page Not Found"
      description="The page you are looking for doesn't exist."
      Icon={SearchX}
      primaryText="Go Home"
      primaryPath="/"
    />
  );
}