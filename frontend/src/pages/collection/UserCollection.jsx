import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const UserCollection = () => {
  const [collections, setCollections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8081/my-collections', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setCollections(response.data);
        } catch (error) {
          console.error('Error fetching collections:', error);
        }
      }
    };

    fetchCollections();
  }, []);

  const handleEdit = (collectionId) => {
    
    navigate(`/edit/${collectionId}`);
  };

  const handleDelete = async (collectionId) => {
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8081/collection/${collectionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
   
      setCollections(prevCollections => prevCollections.filter(collection => collection.id !== collectionId));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  return (
    <div className="container">
      <h2 className="mt-4 mb-3 text-center">My Collections</h2>
      {collections.length > 0 ? (
        <div className="row">
          {collections.map(collection => (
            <div className="col-md-4 mb-4" key={collection.id}>
              <div className="card">
                <img src={collection.image} className="card-img-top" alt={collection.name} />
                <div className="card-body">
                  <h5 className="card-title">{collection.name}</h5>
                  <p className="card-text">{collection.description}</p>
                  <p className="card-text"><strong>Category:</strong> {collection.category}</p>
                  <div className="d-flex justify-content-between">
                    <button onClick={() => handleEdit(collection.id)} className="btn btn-primary">Edit</button>
                    <button onClick={() => handleDelete(collection.id)} className="btn btn-danger">Delete</button>
					<Link to="/create" className="btn btn-success mb-3">Create Collection</Link>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">You have no collections.</p>
      )}
    </div>
  );
};

export default UserCollection;