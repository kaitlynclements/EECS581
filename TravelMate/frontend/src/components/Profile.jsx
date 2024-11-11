import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Profile() {
    const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '' });
    const [isEditing, setIsEditing] = useState({ first_name: false, last_name: false, email: false });
    const [changePassword, setChangePassword] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                console.error("User ID not found in localStorage");
                return;
            }
            try {
                const response = await api.get(`/profile/${userId}`, { withCredentials: true });
                setProfile(response.data);
            } catch (error) {
                console.error("Profile fetch error:", error.response ? error.response.data : error.message);
                alert("Error fetching profile: " + (error.response ? error.response.data.error : error.message));
            }
        };
        fetchProfile();
    }, []);

    const handleEditToggle = (field) => {
        setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const saveProfileField = async (field) => {
        try {
            const response = await api.put(`/profile/${localStorage.getItem('user_id')}`, { [field]: profile[field] });
            setProfile(response.data);
            setIsEditing((prev) => ({ ...prev, [field]: false }));
        } catch (error) {
            console.error("Profile update error:", error);
            alert("Error updating profile field.");
        }
    };

    const handlePasswordChange = async () => {
        try {
            await api.put(`/profile/${localStorage.getItem('user_id')}/change-password`, {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            alert("Password changed successfully.");
            setChangePassword(false);
            setPasswords({ currentPassword: '', newPassword: '' });
        } catch (error) {
            console.error("Password change error:", error);
            alert("Error changing password.");
        }
    };

    return (
      <div>
          <h1>Profile</h1>
          <div>
              <p style={{ marginBottom: '15px' }}>
                  First Name: 
                  {isEditing.first_name ? (
                      <input
                          name="first_name"
                          value={profile.first_name}
                          onChange={handleInputChange}
                          style={{ marginLeft: '10px' }}
                      />
                  ) : (
                      <span style={{ marginLeft: '10px' }}>{profile.first_name}</span>
                  )}
                  <button onClick={() => handleEditToggle('first_name')} style={{ marginLeft: '10px' }}>
                      {isEditing.first_name ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing.first_name && (
                      <button onClick={() => saveProfileField('first_name')} style={{ marginLeft: '5px' }}>Save</button>
                  )}
              </p>
              <p style={{ marginBottom: '15px' }}>
                  Last Name: 
                  {isEditing.last_name ? (
                      <input
                          name="last_name"
                          value={profile.last_name}
                          onChange={handleInputChange}
                          style={{ marginLeft: '10px' }}
                      />
                  ) : (
                      <span style={{ marginLeft: '10px' }}>{profile.last_name}</span>
                  )}
                  <button onClick={() => handleEditToggle('last_name')} style={{ marginLeft: '10px' }}>
                      {isEditing.last_name ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing.last_name && (
                      <button onClick={() => saveProfileField('last_name')} style={{ marginLeft: '5px' }}>Save</button>
                  )}
              </p>
              <p style={{ marginBottom: '15px' }}>
                  Email: 
                  {isEditing.email ? (
                      <input
                          name="email"
                          value={profile.email}
                          onChange={handleInputChange}
                          style={{ marginLeft: '10px' }}
                      />
                  ) : (
                      <span style={{ marginLeft: '10px' }}>{profile.email}</span>
                  )}
                  <button onClick={() => handleEditToggle('email')} style={{ marginLeft: '10px' }}>
                      {isEditing.email ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing.email && (
                      <button onClick={() => saveProfileField('email')} style={{ marginLeft: '5px' }}>Save</button>
                  )}
              </p>
          </div>
          <button onClick={() => setChangePassword(true)} style={{ marginTop: '20px' }}>Change Password</button>
          {changePassword && (
              <div style={{ marginTop: '20px' }}>
                  <h3>Change Password</h3>
                  <input
                      type="password"
                      placeholder="Current Password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      style={{ display: 'block', marginBottom: '10px' }}
                  />
                  <input
                      type="password"
                      placeholder="New Password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      style={{ display: 'block', marginBottom: '10px' }}
                  />
                  <button onClick={handlePasswordChange} style={{ marginRight: '10px' }}>Submit</button>
                  <button onClick={() => setChangePassword(false)}>Cancel</button>
              </div>
          )}
      </div>
  );
}
export default Profile;
