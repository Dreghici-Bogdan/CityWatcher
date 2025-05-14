import mapPinsData from '../data/mapPins.json';

export const getAllPins = () => {
  return mapPinsData.pins;
};

export const getPinsByType = (problemType) => {
  return mapPinsData.pins.filter(pin => pin.problem_type === problemType);
};

export const getPinsByUser = (userId) => {
  return mapPinsData.pins.filter(pin => pin.user.id === userId);
};

export const getProblemTypeConfig = (problemType) => {
  return mapPinsData.problem_types[problemType];
};

export const addNewPin = async (pinData) => {
  // In a real application, this would make an API call
  // For now, we'll just return the data as if it was saved
  const newPin = {
    id: String(mapPinsData.pins.length + 1),
    created_at: new Date().toISOString(),
    status: "pending",
    ...pinData
  };
  
  // In a real app, you would save this to a backend
  return newPin;
}; 