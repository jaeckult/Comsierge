import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import HighPriorityMessages from "./components/HighPriorityMessages";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col p-8">
        <Header />
        <StatsCards />
        <HighPriorityMessages />
      </main>
    </div>
  );
} 