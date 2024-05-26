import axios from 'axios';

const API_BASE_URL =
  'https://NOTHERE.execute-api.eu-central-1.amazonaws.com/prod';
const API_KEY = 'NOT-HERE';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'x-api-key': API_KEY,
  },
});

export const getClubs = async () => {
  const response = await axiosInstance.get('/clubs');
  console.log(response.data);
  return response.data;
};

export const createClub = async (club: { name: string; nation: string }) => {
  const response = await axiosInstance.post('/clubs', club);
  console.log('response', response);
  return {
    status: response.status || 201,
  };
};

export const deleteClub = async (id: string) => {
  await axiosInstance.delete(`/clubs/${id}`);
};

export const filterClubsByNation = async (nation: string) => {
  const response = await axiosInstance.get(`/nation`, {
    params: { nation },
  });
  return response.data;
};
