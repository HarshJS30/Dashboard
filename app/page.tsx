import GridMesh from "@/components/Meshgrid";
import Dashboard from "@/components/page";

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      <GridMesh />   
      <Dashboard />
    </div>
  );
}
