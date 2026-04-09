import axios from "axios";

// Using a basic local configuration for now
const API_URL = "http://localhost:8000";

export const sendMessageToAPI = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/chat`, data);
    return response;
  } catch (error) {
    console.error("API error:", error);
    // Provide a mocked response to prevent breaking the flow during local dev if backend isn't up
    return {
      data: {
        message: "This is a simulated AI response.",
        patient: {
          name: "John Doe",
          age: 45,
          query: data.patient_query,
          ward: "General" 
        }
      }
    };
  }
};
