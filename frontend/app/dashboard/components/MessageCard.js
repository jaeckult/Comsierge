export default function MessageCard({ sender, content, date, priority }) {
  return (
    <div className="bg-[#0e191f] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between border-l-4 border-[#00ffd0] shadow">
      <div>
        <div className="font-bold text-white">{sender}</div>
        <div className="text-sm text-gray-300">{content}</div>
        <div className="text-xs text-gray-500 mt-1">{date}</div>
      </div>
      {priority && (
        <span className="mt-2 sm:mt-0 sm:ml-4 px-3 py-1 bg-[#003f3f] text-[#00ffd0] rounded-full text-xs font-semibold self-start sm:self-center">HIGH PRIORITY</span>
      )}
    </div>
  );
} 