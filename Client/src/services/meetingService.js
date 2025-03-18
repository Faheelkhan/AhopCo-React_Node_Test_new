import api from './api';

const getAllMeetings = async (params) => {
  try {
    const response = await api.get('/meeting', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getMeeting = async (id) => {
  try {
    const response = await api.get(`/meeting/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createMeeting = async (meetingData) => {
  try {
    const response = await api.post('/meeting', meetingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateMeeting = async (id, meetingData) => {
  try {
    const response = await api.put(`/meeting/${id}`, meetingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteMeeting = async (id) => {
  try {
    const response = await api.delete(`/meeting/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteManyMeetings = async (ids) => {
  try {
    const response = await api.delete('/meeting', { data: ids });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const meetingService = {
  getAllMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  deleteManyMeetings
};

export default meetingService; 