import { useState, useEffect } from 'react';

const GenreFilter = ({ onGenreChange }) => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    // Load the JSON data
    fetch('/critically_acclaimed_albums_by_genre.json')
      .then(response => response.json())
      .then(data => {
        setGenres(Object.keys(data));
      });
  }, []);

  return (
    <div className="mb-4">
      <label htmlFor="genre" className="block text-lg font-medium text-gray-700">
        Select Genre:
      </label>
      <select
        id="genre"
        name="genre"
        onChange={(e) => onGenreChange(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="">All Genres</option>
        {genres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenreFilter;