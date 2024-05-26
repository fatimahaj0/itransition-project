import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Items() {
    const { collectionId } = useParams();
    const [items, setItems] = useState([]);
    const [itemData, setItemData] = useState({
        name: '',
        tags: '',
    });
    const [customFields, setCustomFields] = useState([]);
    const [error, setError] = useState(null);
    const [fieldCounts, setFieldCounts] = useState({
        string: 0,
        number: 0,
        multiline: 0,
        date: 0,
        boolean: 0
    });
    const [tagSuggestions, setTagSuggestions] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`http://localhost:8081/collection/${collectionId}/items`);
                if (!response.ok) {
                    throw new Error('Failed to fetch items');
                }
                const responseData = await response.json();
                setItems(responseData);
                setError(null);
            } catch (error) {
                console.error('Error fetching items:', error);
                setError('Failed to fetch items');
            }
        };

        fetchItems();
    }, [collectionId]);


useEffect(() => {
    if (itemData.tags.trim() !== '') {
        const fetchTags = async () => {
            try {
                const response = await fetch(`http://localhost:8081/tags?query=${itemData.tags}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch tags');
                }
                const tagsData = await response.json();
                setTagSuggestions(tagsData);
                console.log('Tags fetched:', tagsData);
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        fetchTags();
    }
}, [itemData.tags]);



   

    const handleChange = (event) => {
        setItemData(prevItemData => ({
        ...prevItemData,
        [event.target.name]: event.target.value,
    }));
};
    const handleCustomFieldNameChange = (index, value) => {
        const updatedCustomFields = [...customFields];
        updatedCustomFields[index].name = value;
        setCustomFields(updatedCustomFields);
    };

    const handleCustomFieldValueChange = (index, value) => {
        const updatedCustomFields = [...customFields];
        updatedCustomFields[index].value = value;
        setCustomFields(updatedCustomFields);
    };

    const handleDateChange = (index, field, value) => {
        const updatedCustomFields = [...customFields];
        updatedCustomFields[index][field] = value;
        
        const { year, month, day } = updatedCustomFields[index];
        updatedCustomFields[index].value = `${year}-${month}-${day}`;
        setCustomFields(updatedCustomFields);
    };

    const addCustomField = (fieldType) => {
        if (fieldCounts[fieldType] >= 3) {
            setError('Maximum of three fields allowed for each type');
            return;
        }
        
        setFieldCounts({
            ...fieldCounts,
            [fieldType]: fieldCounts[fieldType] + 1
        });

        setCustomFields([...customFields, { name: '', value: getDefaultFieldValue(fieldType), type: fieldType, year: '', month: '', day: '' }]);
    };

    const getDefaultFieldValue = (type) => {
        switch (type) {
            case 'string':
                return '';
            case 'number':
                return 0;
            case 'multiline':
                return '';
            case 'date':
                return ''; 
            case 'boolean':
                return false;
            default:
                return '';
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`http://localhost:8081/collection/${collectionId}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...itemData, customFields }),
            });

            if (!response.ok) {
                throw new Error('Failed to create item');
            }

            const responseData = await response.json();
            console.log('New item created:', responseData);
            setItems([...items, responseData]);
            setItemData({
                name: '',
                tags: '',
            });
            setCustomFields([]);
            setError(null);
         
            setFieldCounts({
                string: 0,
                number: 0,
                multiline: 0,
                date: 0,
                boolean: 0
            });
        } catch (error) {
            console.error('Error creating item:', error);
            setError('Failed to create item: ' + error.message);
        }
    };

    return (
        <div className="container">
            <h2>Items for Collection ID: {collectionId}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <div>Name: {item.name}</div>
                        <div>Tags: {item.tags}</div>
                        {item.customFields && (
                            <ul>
                                {item.customFields.map((field, index) => (
                                    <li key={index}>
                                        <div>{field.name}: {field.type === 'boolean' ? (field.value ? 'Yes' : 'No') : field.value}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

            <h2 className="mt-4 mb-3 text-center">Create an item</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Name:
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={itemData.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="tags" className="form-label">
                        Tags:
                    </label>
    
<input
    type="text"
    id="tags"
    name="tags"
    value={itemData.tags}
    onChange={handleChange}
    className="form-control"
    required
/>

<div className="autocomplete-dropdown">
        {tagSuggestions.length > 0 && tagSuggestions.map((tag) => (
            <div key={tag.id}>
                {tag.name}
            </div>
        ))}
    </div>
</div>
                  
                {customFields.map((field, index) => (
                    <div key={index}>
                        <label htmlFor={`customFieldName-${index}`} className="form-label">
                            Custom Field Name:
                        </label>
                        <input
                            type="text"
                            id={`customFieldName-${index}`}
                            value={field.name}
                            onChange={(e) => handleCustomFieldNameChange(index, e.target.value)}
                            className="form-control"
                        />
                        <label htmlFor={`customFieldValue-${index}`} className="form-label">
                            Custom Field Value:
                        </label>
                        {field.type === 'multiline' ? (
                            <textarea
                                id={`customFieldValue-${index}`}
                                value={field.value}
                                onChange={(e) => handleCustomFieldValueChange(index, e.target.value)}
                                className="form-control"
                            />
                        ) : field.type === 'boolean' ? (
                            <input
                                type="checkbox"
                                id={`customFieldValue-${index}`}
                                checked={field.value}
                                onChange={(e) => handleCustomFieldValueChange(index, e.target.checked)}
                                className="form-check-input"
                            />
                        ) : field.type === 'date' ? (
                            <div>
                                <select
                                    value={field.month}
                                    onChange={(e) => handleDateChange(index, 'month', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Month</option>
                                    {[...Array(12).keys()].map(i => (
                                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}</option>
                                    ))}
                                </select>
                                <select
                                    value={field.day}
                                    onChange={(e) => handleDateChange(index, 'day', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Day</option>
                                    {[...Array(31).keys()].map(i => (
                                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}</option>
                                    ))}
                                </select>
                                <select
                                    value={field.year}
                                    onChange={(e) => handleDateChange(index, 'year', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Year</option>
                                    {[...Array(50).keys()].map(i => (
                                        <option key={i + 1970} value={i + 1970}>{i + 1970}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <input
                                type={field.type === 'number' ? 'number' : 'text'}
                                id={`customFieldValue-${index}`}
                                value={field.value}
                                onChange={(e) => handleCustomFieldValueChange(index, e.target.value)}
                                className="form-control"
                            />
                        )}
                    </div>
                ))}

                <button type="button" className="btn btn-primary me-2 mb-2" onClick={() => addCustomField('string')}>
                    Add text
                </button>
                <button type="button" className="btn btn-primary me-2 mb-2" onClick={() => addCustomField('number')}>
                    Add Number 
                </button>
                <button type="button" className="btn btn-primary me-2 mb-2" onClick={() => addCustomField('multiline')}>
                    Add Description
                </button>
                <button type="button" className="btn btn-primary me-2 mb-2" onClick={() => addCustomField('date')}>
                    Add Date 
                </button>
                <button type="button" className="btn btn-primary me-2 mb-2" onClick={() => addCustomField('boolean')}>
                    Add checkbox
                </button>

                <button type="submit" className="btn btn-dark">
                    Create
                </button>
            </form>
        </div>
    );
}

export default Items;