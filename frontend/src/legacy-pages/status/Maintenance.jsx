import { Wrench } from "lucide-react"; 
import StatusPage from "../../components/StatusPage/StatusPage";
import api from "../../services/api/axios";
import { useRouter } from "next/navigation";

export default function Maintenance() {
  const router = useRouter();

  const handleRefresh = async () => {
    try {

      // Health check
      await api.get("/health");

      router.push("/");

    } catch (err) {
      if (err.response?.status === 503) {
        return;
      }

      // Other error
      window.location.reload();
    }
  };

  return (
    <StatusPage
      code="503"
      title="Maintenance Mode"
      description="We are upgrading our system. We'll be back soon."
      Icon={Wrench}
      primaryText="Refresh"
      onPrimaryClick={handleRefresh}
    />
  );
}
