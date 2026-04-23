import FeatureBridge from "../components/FeatureBridge";

export default function UserManagementPage() {
  return (
    <FeatureBridge
      title="User Management"
      module="M"
      url="http://localhost:5174/admin"
      note="This keeps your original M admin screens active while staying inside the main app route."
    />
  );
}
