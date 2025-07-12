import MessageCard from "./MessageCard";

const messages = [
  {
    sender: "Acme Corp",
    content: "Your order #12345 has shipped!",
    date: "Jul 5, 2025, 7:36 PM",
    priority: true,
  },
  {
    sender: "+15558889999",
    content: "URGENT: Your account needs verification.",
    date: "Jul 3, 2025, 7:36 PM",
    priority: true,
  },
];

export default function HighPriorityMessages() {
  return (
    <section className="bg-[#131a22] rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">High-Priority Messages</h2>
      <div className="flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <MessageCard key={idx} {...msg} />
        ))}
      </div>
    </section>
  );
} 