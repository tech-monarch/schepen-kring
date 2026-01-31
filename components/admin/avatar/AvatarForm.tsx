'use client';
import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  UploadCloud, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  File as FileIcon, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { toast } from "sonner";
import { Label } from '@/components/ui/label';
import { Avatar } from '@/types/avatar.d';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// ✅ Hardcoded API base
const API_BASE = "https://api.answer24.nl/api/v1";
  
// ✅ Create avatar (POST)
export async function createAvatar(token: string, payload: any) {
  const res = await fetch(`${API_BASE}/avatars`, {
    method: "POST",
    headers:
      payload instanceof FormData
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Failed to create avatar");
  }

  return await res.json();
}

// ✅ Update avatar (POST)
export async function updateAvatar(id: string, token: string, payload: any) {
  const res = await fetch(`${API_BASE}/avatars/${id}`, {
    method: "POST",
    headers:
      payload instanceof FormData
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Failed to update avatar");
  }

  return await res.json();
}

interface AvatarFormProps {
  avatar?: Avatar;
}

const AvatarForm: React.FC<AvatarFormProps> = ({ avatar }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(avatar?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface AvatarFormData {
    name: string;
    role: string;
    description: string;
    required_plan: string;
    functions: string[];
  }

  const [formData, setFormData] = useState<AvatarFormData>({
    name: avatar?.name || '',
    role: avatar?.role || '',
    description: avatar?.description || '',
    required_plan: avatar?.required_plan || 'small',
    functions: avatar?.functions || [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFunctionChange = (index: number, value: string) => {
    const newFunctions = [...formData.functions];
    newFunctions[index] = value;
    setFormData(prev => ({
      ...prev,
      functions: newFunctions
    }));
  };

  const handleAddFunction = () => {
    if (formData.functions.every((fn: string) => fn.trim() !== '')) {
      setFormData(prev => ({
        ...prev,
        functions: [...prev.functions, '']
      }));
    }
  };

  const handleRemoveFunction = (index: number) => {
    const newFunctions = formData.functions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      functions: newFunctions
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return setError('No file selected');

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) return setError('Invalid image type. Please select a JPG, PNG, or GIF file.');

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return setError('Image size should be less than 5MB');

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getToken = (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || '';
    }
    return '';
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const token = getToken();
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      let payload: any;
      if (selectedFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('role', formData.role.trim());
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('required_plan', formData.required_plan);
        formData.functions
          .filter(fn => fn.trim() !== '')
          .forEach((fn, index) => {
            formDataToSend.append(`functions[${index}]`, fn.trim());
          });
        formDataToSend.append('image', selectedFile);
        payload = formDataToSend;
      } else {
        payload = {
          name: formData.name.trim(),
          role: formData.role.trim(),
          description: formData.description.trim(),
          required_plan: formData.required_plan,
          functions: formData.functions.filter(fn => fn.trim() !== ''),
        };
      }

      if (avatar) {
        const result = await updateAvatar(avatar.id, token, payload);
        if (result) {
          toast.success("Avatar updated successfully");
          window.location.href = '/nl/dashboard/admin/avatar';
        }
      } else {
        const result = await createAvatar(token, payload);
        if (result) {
          toast.success("Avatar created successfully");
          window.location.href = '/nl/dashboard/admin/avatar';
        }
      }
    } catch (err: any) {
      console.error('Error saving avatar:', err);
      const errorMessage = err?.message || 'An unexpected error occurred while saving the avatar.';
      setError(errorMessage);
      toast.error("Error: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive" className='mb-6'>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Avatar Details</CardTitle>
              <CardDescription>Provide the details for your new avatar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="font-semibold">Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Alex"
                    required 
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="font-semibold">Role *</Label>
                  <Input 
                    id="role" 
                    name="role" 
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g. Customer Support"
                    required 
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="font-semibold">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A brief description of the avatar..."
                  rows={3}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="font-semibold">Functions *</Label>
                <div className="space-y-3 mt-2">
                  {formData.functions.map((func, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input
                        type="text"
                        value={func}
                        onChange={(e) => handleFunctionChange(index, e.target.value)}
                        placeholder="Enter function name"
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveFunction(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFunction}
                  className="mt-4"
                  disabled={formData.functions.some(fn => !fn.trim())}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Function
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Plan & Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="required_plan" className="font-semibold">Required Plan</Label>
                <Select value={formData.required_plan} onValueChange={(value: string) => 
                  setFormData(prev => ({ ...prev, required_plan: value }))
                }>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="big">Big</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-semibold">Avatar Image</Label>
                <div 
                  onClick={triggerFileInput}
                  className="mt-2 relative border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors aspect-video"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                  />
                  {previewImage ? (
                    <div className="relative w-full h-full rounded-md overflow-hidden">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      <UploadCloud className="h-10 w-10 mx-auto mb-2" />
                      <p className="text-sm font-semibold">Click to upload</p>
                      <p className="text-xs">JPG, PNG, or GIF up to 5MB</p>
                    </div>
                  )}
                </div>
                {selectedFile && (
                  <div className="mt-4 flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-5 w-5 text-slate-500" />
                      <span className="text-sm text-slate-700 truncate max-w-[180px]">{selectedFile.name}</span>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-8 sticky bottom-0 bg-white/80 backdrop-blur-sm py-4 px-8 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {avatar ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{avatar ? 'Update Avatar' : 'Create Avatar'}</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AvatarForm;
