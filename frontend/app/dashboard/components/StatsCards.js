const stats = [
  { label: "Messages", value: 5, sub: "New messages" },
  { label: "Held", value: 1, sub: "Pending review" },
  { label: "Conditions", value: "1 active", sub: "Forwarding conditions" },
];

export default function StatsCards() {
  return (
    <section className="flex gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#181f2a] rounded-lg p-6 flex flex-col items-start min-w-[180px] shadow"
        >
          <div className="text-2xl font-bold mb-1">{stat.value}</div>
          <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
          <div className="text-xs text-gray-500">{stat.sub}</div>
        </div>
      ))}
    </section>
  );
} 