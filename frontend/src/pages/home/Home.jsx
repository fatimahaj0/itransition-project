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
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Image</th>
                            <th>View Items</th> 
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.description}</td>
                                <td>{item.category}</td>
                                <td>{item.image}</td>
                                <td> 
                                 <Link to={`/collection/${item.id}/items`}>View Items</Link>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Home;
