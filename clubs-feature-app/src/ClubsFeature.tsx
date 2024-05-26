import React, { useState, useEffect } from 'react';
import {
  getClubs,
  createClub,
  deleteClub,
  filterClubsByNation,
} from './api/clubService';

const ClubsFeature: React.FC = () => {
  const [clubs, setClubs] = useState([]);
  const [name, setName] = useState('');
  const [nation, setNation] = useState('');
  const [filterNation, setFilterNation] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClubs() {
      const data = await getClubs();
      setClubs(data);
    }
    fetchClubs();
  }, []);

  const handleAddClub = async () => {
    const newClub = { name, nation };
    await createClub(newClub);
    const updatedClubs = await getClubs();
    setClubs(updatedClubs);
    addedClubNotification(name);
    setName('');
    setNation('');
  };

  const handleDeleteClub = async (id: string) => {
    await deleteClub(id);
    const updatedClubs = await getClubs();
    setClubs(updatedClubs);
  };

  const handleFilterClubs = async () => {
    const filteredClubs = await filterClubsByNation(filterNation);
    setClubs(filteredClubs);
  };

  const handleClearFilter = async () => {
    const updatedClubs = await getClubs();
    setClubs(updatedClubs);
    setFilterNation('');
  };

  const addedClubNotification = (club: string) => {
    setNotification(`Added ${club}`);
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Hide notification after 3 seconds
  };

  return (
    <div className='window' style={{ width: '400px' }}>
      <div className='title-bar'>
        <div className='title-bar-text'>Clubs Management</div>
        <div className='title-bar-controls'>
          <button aria-label='Minimize'></button>
          <button aria-label='Maximize'></button>
          <button aria-label='Close'></button>
        </div>
      </div>
      <div className='window-body'>
        {notification && (
          <div className='status-bar'>
            <p className='status-bar-field'>{notification}</p>
          </div>
        )}
        <div
          className='sunken-panel'
          style={{ height: '200px', overflowY: 'scroll' }}
        >
          <table className='table-view'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Nation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map(
                (club: { id: string; name: string; nation: string }) => (
                  <tr key={club.id}>
                    <td>{club.name}</td>
                    <td>{club.nation}</td>
                    <td>
                      <button
                        className='button'
                        onClick={() => handleDeleteClub(club.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <div className='field-row-stacked'>
          <label htmlFor='name'>Name</label>
          <input
            id='name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='text-box'
          />
        </div>
        <div className='field-row-stacked'>
          <label htmlFor='nation'>Nation</label>
          <input
            id='nation'
            type='text'
            value={nation}
            onChange={(e) => setNation(e.target.value)}
            className='text-box'
          />
        </div>
        <button className='button' onClick={handleAddClub}>
          Add Club
        </button>
        <div className='field-row-stacked'>
          <label htmlFor='filterNation'>Filter by Nation</label>
          <input
            id='filterNation'
            type='text'
            value={filterNation}
            onChange={(e) => setFilterNation(e.target.value)}
            className='text-box'
          />
        </div>
        <button className='button' onClick={handleFilterClubs}>
          Filter Clubs
        </button>
        <button className='button' onClick={handleClearFilter}>
          Clear Filter
        </button>
      </div>
    </div>
  );
};

export default ClubsFeature;
