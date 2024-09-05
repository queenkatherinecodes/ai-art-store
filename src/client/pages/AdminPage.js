import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const AdminPage = () => {
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [filterPrefix, setFilterPrefix] = useState('');

    useEffect(() => {
        fetchActivities();
    }, []);

    useEffect(() => {
        filterActivities();
    }, [filterPrefix, activities]);

    const fetchActivities = async () => {
        try {
            const response = await fetch('/data/activity.log');
            if (response.ok) {
                const text = await response.text();
                const parsedActivities = parseActivityLog(text);
                setActivities(parsedActivities);
            } else {
                console.error('Failed to fetch activities');
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const parseActivityLog = (logText) => {
        return logText.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const [datePart, yearPart, username, activityType] = line.split(',');
                const datetime = `${datePart}, ${yearPart}`;
                return { datetime, username, activityType };
            });
    };

    const filterActivities = () => {
        const filtered = activities.filter(activity => 
            activity.username.toLowerCase().startsWith(filterPrefix.toLowerCase())
        );
        setFilteredActivities(filtered);
    };

    const handleFilterChange = (e) => {
        setFilterPrefix(e.target.value);
    };

    return (
        <div className="admin-page">
            <h1 className="admin-title">Activity Dashboard</h1>
            
            <div className="admin-filter">
                <input
                    type="text"
                    placeholder="Filter by username prefix"
                    value={filterPrefix}
                    onChange={handleFilterChange}
                    className="admin-input"
                />
                <button onClick={fetchActivities} className="admin-button">
                    <RefreshCw size={24} />
                </button>
            </div>
            
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Username</th>
                            <th>Activity Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredActivities.map((activity, index) => (
                            <tr key={index}>
                                <td>{activity.datetime}</td>
                                <td>{activity.username}</td>
                                <td>{activity.activityType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;