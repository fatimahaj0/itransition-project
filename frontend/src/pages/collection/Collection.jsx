import React, { useState } from 'react';
import axios from 'axios';

const Collection = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: ''
  });
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleChange = (event) => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value 
    }));
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async(event) => {
    event.preventDefault();
    const formDataWithFile = new FormData();
    formDataWithFile.append('file', file);
    formDataWithFile.append('upload_preset', 'oe8ddeiz');

    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dfvr0vyzm/image/upload', formDataWithFile);
      const imageUrl = response.data.secure_url;

      const collectionData = {
        ...formData,
        image: imageUrl
      };

      axios.post('http://localhost:8081/create', collectionData)
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

     
      setImageUrl(imageUrl);
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
    }
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
          <label htmlFor="image" className="form-label">Image:</label>
          <input 
            type="file" 
            id="image" 
            name="image" 
            onChange={handleFileChange} 
            className="form-control" 
            required 
          />
        </div>
        {imageUrl && (
          <div className="mb-3">
            <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        )}
        <button type="submit" className="btn btn-dark">Create</button>
      </form>
    </div>
  );
};

export default Collection;