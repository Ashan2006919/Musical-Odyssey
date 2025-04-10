import React from 'react';

const ProfileDetails = ({ user }) => {
    const { username, email, profilePicture, authMethod } = user;

    return (
        <div className="profile-details">
            <h2>Profile Details</h2>
            <img 
                src={profilePicture || '/profile-pictures/default.png'} 
                alt={`${username}'s profile`} 
                className="profile-picture" 
            />
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Email:</strong> {email}</p>
            {authMethod === 'traditional' && <p><strong>Password:</strong> ********</p>}
        </div>
    );
};

export default ProfileDetails;