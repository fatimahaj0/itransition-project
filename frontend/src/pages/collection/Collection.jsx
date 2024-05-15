import React, { useState } from 'react';
import axios from 'axios';

const Collection = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: ''
  });

  const handleChange = (event) => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value 
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    axios.post('http://localhost:8081/create', formData) 
      .then(res => {
        console.log("Response from backend:", res);
      })
      .catch(err => console.log(err));

    setFormData({
      name: '',
      description: '',
      category: '',
      image: ''
    });
  }

  return (
    <div className="container">
      <h2 className="mt-4 mb-3 text-center">Create a Collection</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="form-control" 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description:</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            className="form-control" 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category:</label>
          <input 
            type="text" 
            id="category" 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            className="form-control" 
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image URL:</label>
          <input 
            type="text" 
            id="image" 
            name="image" 
            value={formData.image} 
            onChange={handleChange} 
            className="form-control" 
            required 
          />
        </div>
        <button type="submit" className="btn btn-dark">Create</button>
      </form>
    </div>
  );
};

export default Collection;