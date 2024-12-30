import { Sidebar } from "@/src/components/sidebar";

export default function DashboardPage() {
  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className="w-full sm:w-96">
        <Sidebar />
      </div>
      <div className="w-full">
        <h1>Dashsdfsdfsdfsfsdfsdfsdfsddfsboard</h1>
      </div>
    </div>
  );
}
