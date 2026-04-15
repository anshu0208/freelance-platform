const ConversationList = ({
  conversations = [],
  selected,
  setSelected,
  loading,
}) => {
  return (
    <div className="w-[320px] bg-white border-r flex flex-col">

      {/* HEADER */}
      <div className="p-5 font-semibold text-lg border-b bg-gray-50">
        Messages
      </div>

      <div className="flex-1 overflow-y-auto">

        {loading ? (
          <p className="p-4 text-gray-400">Loading...</p>
        ) : conversations.length === 0 ? (
          <p className="p-4 text-gray-400">No chats yet</p>
        ) : (
          conversations.map((conv) => {
            const isActive = selected?._id === conv._id;

            return (
              <div
                key={conv._id}
                onClick={() => setSelected(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition
                  ${isActive
                    ? "bg-green-50 border-l-4 border-green-500"
                    : "hover:bg-gray-50"}
                `}
              >

                {/* AVATAR */}
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                  {conv.otherUser?.name?.charAt(0).toUpperCase()}
                </div>

                {/* TEXT */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {conv.otherUser?.name}
                  </p>

                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage || "Start chatting"}
                  </p>
                </div>

                {/* UNREAD */}
                {conv.unreadCount > 0 && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        )}

      </div>
    </div>
  );
};

export default ConversationList;