import React from 'react';

const ProfileDetails = ({ user }) => {
    const { name, email, profilePicture, authMethod } = user;

    return (
        <div className="profile-details">
            <h2>Profile Details</h2>
            <img 
                src={profilePicture || '/profile-pictures/default.png'} 
                alt={`${name}'s profile`} 
                className="profile-picture" 
            />
            <p><strong>name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            {authMethod === 'traditional' && <p><strong>Password:</strong> ********</p>}
        </div>
    );
};

export default ProfileDetails;