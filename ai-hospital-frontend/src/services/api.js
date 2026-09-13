import axios from "axios";

const API_URL = "http://localhost:8000";

// Simple session management for thread persistence
let threadId = localStorage.getItem("medeye_thread_id");

if (!threadId) {
  threadId = Math.random().toString(36).substring(7);
  localStorage.setItem("medeye_thread_id", threadId);
}

export const getThreadId = () => threadId;

export const sendMessageToAPI = async (data) => {
  try {
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

export const resetSessionAPI = async () => {
  const oldThreadId = threadId;
  threadId = Math.random().toString(36).substring(7);
  localStorage.setItem("medeye_thread_id", threadId);

  try {
    await axios.post(`${API_URL}/reset`, { thread_id: oldThreadId });
  } catch (err) {
    console.warn("Server reset notice:", err);
  }
};

export const fetchPatientsQueue = async () => {
  try {
    const response = await axios.get(`${API_URL}/patients`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching patients queue:", error);
    return [];
  }
};

export const clearPatientsQueue = async () => {
  try {
    const response = await axios.post(`${API_URL}/patients/clear`);
    return response.data;
  } catch (error) {
    console.error("Error clearing queue:", error);
    return { status: "error" };
  }
};

export const fetchDepartmentsList = async () => {
  try {
    const response = await axios.get(`${API_URL}/departments`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

export const fetchFhirBundle = async (tid) => {
  try {
    const response = await axios.get(`${API_URL}/fhir/bundle/${tid || threadId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching FHIR bundle:", error);
    return null;
  }
};

export const exportAllFhirBundles = async () => {
  try {
    const response = await axios.get(`${API_URL}/fhir/export`);
    return response.data;
  } catch (error) {
    console.error("Error exporting FHIR bundles:", error);
    return null;
  }
};
