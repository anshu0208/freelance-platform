import API from "./api.js";

// 🔹 Send message
export const sendMessage = async ({ conversationId, content }) => {
  const res = await API.post("/messages", {
    conversationId,
    content,
  });

  return res.data;
};

// 🔹 Get messages
export const getMessages = async (conversationId) => {
  const res = await API.get(`/messages/${conversationId}`);
  return res.data;
};