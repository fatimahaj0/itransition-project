import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const getData = async () => {
    try {
        const response = await fetch('http://localhost:8081/collection');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const responseData = await response.json();

        if (!Array.isArray(responseData)) {
            throw new Error('Invalid data format');
        }

        setData(responseData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
  getData();
    }, []);

    return (
        <div className="container">
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th className="color-text color-bg">ID</th>
                            <th className="color-text color-bg">Name</th>
                            <th className="color-text color-bg">Description</th>
                            <th className="color-text color-bg">Category</th>
                            <th className="color-text color-bg">Image</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td className="color-text color-bg">{item.id}</td>
                               <td className="color-text color-bg"> <Link to={`/collection/${item.id}/items`}> {item.name}</Link></td>

                                <td className="color-text color-bg">{item.description}</td>
                                <td className="color-text color-bg">{item.category}</td>
                                <td className="color-text color-bg"> <img src={item.image} alt={item.name} style={{ maxWidth: '100px', height: 'auto' }} /></td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Home;