'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

const DEPARTMENTS = ['Electricity', 'Water', 'Agriculture', 'Law', 'Medical', 'Services'];

export default function RaiseRequestPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('departments').select('*');
        if (data) setDepartments(data);
      } catch (error) {
        console.error('Error loading departments:', error);
      }
    };
    loadDepartments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({ ...prev, department: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.description.split(' ').length > 150) {
      setError('Description must be 150 words or less');
      return;
    }

    if (!formData.title || !formData.description || !formData.department) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data: request, error: requestError } = await supabase
        .from('service_requests')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          department_id: formData.department,
          status: 'raised',
          priority: 'medium',
        })
        .select()
        .single();

      if (requestError) throw requestError;

      if (images.length > 0 && request) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${request.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('request-images')
            .upload(fileName, image);

          if (uploadError) {
            console.error('Image upload error:', uploadError);
          } else {
            const { data: urlData } = supabase.storage
              .from('request-images')
              .getPublicUrl(fileName);

            await supabase
              .from('request_images')
              .insert({
                request_id: request.id,
                image_url: urlData.publicUrl,
              });
          }
        }
      }

      router.push('/user/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Raise a New Request</h1>
        <p className="text-gray-600 mt-2">Report a civic issue to the appropriate department.</p>
      </div>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Request Details</CardTitle>
          <CardDescription>Provide information about your issue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700 font-semibold">Issue Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Brief title of your issue"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="border-gray-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 font-semibold">Description (Max 150 words)</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your issue in detail..."
                className="w-full min-h-32 px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 font-sans"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={1200}
                required
              />
              <p className="text-xs text-gray-600">
                {formData.description.split(' ').filter(w => w.length > 0).length} / 150 words
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-700 font-semibold">Select Department</Label>
              <Select value={formData.department} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="border-gray-200 bg-white">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images" className="text-gray-700 font-semibold">Add Images (Optional)</Label>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              {images.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm font-semibold text-gray-700">{images.length} image(s) selected</p>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="p-2 bg-gray-100 rounded text-xs text-gray-700 truncate">{img.name}</div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Link href="/user/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
