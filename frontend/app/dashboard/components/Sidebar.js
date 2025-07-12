const navItems = [
  "Dashboard",
  "Inbox",
  "AI Chat",
  "SMS Forwarding",
  "SMS Scheduling",
  "Held Messages",
  "Contacts",
  "AI Auto Reply",
  "Settings",
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#10151c] text-white flex flex-col min-h-screen p-6">
      <div className="mb-8">
        <span className="text-lg font-bold text-[#b16cff]">Comsierge</span>
        <div className="text-xs text-gray-400 mt-1">+19828605947</div>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item, idx) => (
            <li key={item}>
              <a
                href="#"
                className={`block px-4 py-2 rounded transition-colors ${idx === 0 ? "bg-[#1e2a36] text-[#00ffd0]" : "hover:bg-[#23272f]"}`}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <footer className="mt-8 text-xs text-gray-500">© 2025 Comsierge. All rights reserved.</footer>
    </aside>
  );
} 