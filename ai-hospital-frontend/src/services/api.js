import axios from "axios";

const API_URL = "http://localhost:8000";

// Simple session management for thread persistence
let threadId = localStorage.getItem("medeye_thread_id");

if (!threadId) {
  threadId = Math.random().toString(36).substring(7);
  localStorage.setItem("medeye_thread_id", threadId);
}

export const sendMessageToAPI = async (data) => {
  try {
    // Include the threadId in every request to maintain conversation context
    const response = await axios.post(`${API_URL}/chat`, {
      ...data,
      thread_id: threadId
    });
    return response;
  } catch (error) {
    console.error("API error:", error);
    return {
      data: {
        message: "Sorry, I'm having trouble connecting to the hospital systems. Please try again.",
        patient: null
      }
    };
  }
};

export const resetSession = () => {
  threadId = Math.random().toString(36).substring(7);
  localStorage.setItem("medeye_thread_id", threadId);
};
