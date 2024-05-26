import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [usersWithCollections, setUsersWithCollections] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchUsersWithCollections = async () => {
      try {
        const response = await axios.get('http://localhost:8081/users-with-collections');
        setUsersWithCollections(response.data);
      } catch (error) {
        console.error('Error fetching users with collections:', error);
      }
    };

    fetchUsersWithCollections();
  }, []);

  const handleCreateCollection = (userId) => {
    navigate(`/create?userId=${userId}`);
  };

  return (
    <div>
      <h2>Users with Collections</h2>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Collections</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {usersWithCollections.map(user => (
            <tr key={user.userId}>
              <td>{user.userId}</td>
              <td>{user.username}</td>
              <td>
                <ul>
                  {user.collections.map(collection => (
                    <li key={collection.collectionId}>{collection.collectionName}</li>
                  ))}
                </ul>
              </td>
              <td>
                <button onClick={() => handleCreateCollection(user.userId)}>Create Collection</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
