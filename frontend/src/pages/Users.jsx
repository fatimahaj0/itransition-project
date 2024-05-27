import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { jwtDecode } from 'jwt-decode';

const Users = () => {
  const [usersWithCollections, setUsersWithCollections] = useState([]);
  const navigate = useNavigate();
  const { revokeAdminStatus } = useAuth();

  useEffect(() => {
  const fetchUsersWithCollections = async () => {
    try {
      const response = await axios.get('http://localhost:8081/users-with-collections');
      console.log('Fetched users with collections:', response.data);
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

const toggleAdminStatus = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const user = usersWithCollections.find(user => user.userId === userId);
    const newAdminStatus = user.admin === 1 ? 0 : 1;
    await axios.put(
      `http://localhost:8081/users/${userId}/admin`,
      { admin: newAdminStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  
    setUsersWithCollections(prevState =>
      prevState.map(user =>
        user.userId === userId ? { ...user, admin: newAdminStatus } : user
      )
    );

    
    if (userId === jwtDecode(token).id && newAdminStatus === 0) {
      revokeAdminStatus();
      navigate('/');
    }
  } catch (error) {
    console.error('Error updating admin status:', error);
  }
};


  const isAdminUser = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      return decodedToken.isAdmin;
    }
    return false;
  };

  console.log('Rendered users:', usersWithCollections);

  return (
    <div>
      <h2>Users with Collections</h2>
      <table key={usersWithCollections}>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Collections</th>
            <th>Actions</th>
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
                {isAdminUser() && (
                  <button onClick={() => toggleAdminStatus(user.userId)}>
                    {user.admin === 1 ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
