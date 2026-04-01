import React from 'react';

export const WorkspaceCard: React.FC<{
  id: string;
  name: string;
  location: string;
  hourlyRate: number;
  capacity: number;
  images: string[];
}> = ({ id, name, location, hourlyRate, capacity, images }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {images.length > 0 && (
        <img
          src={images[0]}
          alt={name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{name}</h3>
        <p className="text-gray-600 mb-2">{location}</p>
        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-bold">${hourlyRate}/hr</span>
          <span className="text-sm text-gray-500">Capacity: {capacity}</span>
        </div>
      </div>
    </div>
  );
};
