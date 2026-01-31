'use client';
import { useEffect, useState } from 'react';
import { getAvatarById } from '@/app/[locale]/actions/avatar';
import AvatarForm from '@/components/admin/avatar/AvatarForm';
import { Avatar } from '@/types/avatar.d';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

const UpdateAvatarClient = () => {
  const { id } = useParams<{ id: string }>()
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        setLoading(true);
        const avatarData = await getAvatarById(id);
        setAvatar(avatarData);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAvatar();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Avatar not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Update Avatar</h1>
        <p className="text-gray-600">Edit the avatar details below</p>
      </div>
      
      <AvatarForm avatar={avatar} />
    </div>
  );
};

export default UpdateAvatarClient;
