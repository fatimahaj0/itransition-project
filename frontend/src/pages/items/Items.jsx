
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Items() {
    const { collectionId } = useParams();
    const [items, setItems] = useState([]);

    useEffect(() => {
        console.log('Fetching items for collection ID:', collectionId);
        const fetchItems = async () => {
    try {
        const response = await fetch(`http://localhost:8081/collection/${collectionId}/items`);
        if (!response.ok) {
            throw new Error('Failed to fetch items');
        }
        const responseData = await response.json();

        // Check if responseData is an array (assuming your API returns an array)
        if (!Array.isArray(responseData)) {
            throw new Error('Invalid data format');
        }

        setItems(responseData);
    } catch (error) {
        console.error('Error fetching items:', error);
    }
};

        fetchItems();
    }, [collectionId]);

    console.log('Items:', items);

    return (
        <div className="container">
            <h2>Items for Collection ID: {collectionId}</h2>
            
                {items.map((item, index) => (
				<ul>
                    <li key={index}>{item.id}</li>
					<li>{item.name}</li>
					<li>{item.tags}</li>
					</ul>
                ))}
            
        </div>
    );
}

export default Items;
