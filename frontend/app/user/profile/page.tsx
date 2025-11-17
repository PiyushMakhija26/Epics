'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const INITIAL_PROFILE = {
  email: 'john.doe@example.com',
  fullName: 'John Doe',
  address: '123 Main Street',
  city: 'San Francisco',
  state: 'California',
  phone: '(555) 123-4567',
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_PROFILE);
  const [saved, setSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">View and manage your account information.</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900">Profile Information</CardTitle>
              <CardDescription>Your personal and contact details</CardDescription>
            </div>
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Email</Label>
              <p className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md">{profile.email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-700 font-semibold">Full Name</Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="border-gray-200 bg-white"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md">{profile.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="border-gray-200 bg-white"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md">{profile.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-700 font-semibold">Address</Label>
              {isEditing ? (
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="border-gray-200 bg-white"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md">{profile.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700 font-semibold">City</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="border-gray-200 bg-white"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md">{profile.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-700 font-semibold">State</Label>
                {isEditing ? (
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="border-gray-200 bg-white"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md">{profile.state}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleCancel} className="flex-1 border-gray-200">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            )}

            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
                Profile updated successfully!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
