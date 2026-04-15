import { useAuth } from "../context/AuthContext";

const MessageBubble = ({ msg, prevMsg }) => {
  const { user } = useAuth();

  const mine =
    msg.senderId === user?._id ||
    msg.senderId?._id === user?._id;

  const isSameSender =
    prevMsg &&
    (prevMsg.senderId === msg.senderId ||
      prevMsg.senderId?._id === msg.senderId?._id);

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>

      <div className="flex flex-col max-w-[75%]">

        <div
          className={`
            px-4 py-2 text-sm shadow-sm backdrop-blur-md transition-all
            ${mine
              ? "bg-[rgb(34,197,94)] text-white rounded-2xl rounded-br-none shadow-[0_4px_14px_rgba(34,197,94,0.25)]"
              : "bg-[rgb(245,247,250)] text-gray-800 border border-gray-200 rounded-2xl rounded-bl-none"}
            ${isSameSender ? "mt-1" : "mt-3"}
          `}
        >
          {/* MESSAGE TEXT */}
          <p className="break-words leading-relaxed">
            {msg.content}
          </p>

          {/* TIME + STATUS */}
          <div className="flex justify-end items-center gap-1 mt-1">

            <span className="text-[10px] opacity-70">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {/* ✔✔ STATUS */}
            {mine && (
              <span
                className={`text-[11px] ml-1 font-semibold transition ${
                  msg.status === "read"
                    ? "text-[rgb(59,130,246)]"   // blue
                    : msg.status === "delivered"
                    ? "text-gray-400"
                    : "text-gray-300"
                }`}
              >
                ✔✔
              </span>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

export default MessageBubble;