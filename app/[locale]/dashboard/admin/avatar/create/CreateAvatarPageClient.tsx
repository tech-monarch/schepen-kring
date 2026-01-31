'use client';
import AvatarForm from '@/components/admin/avatar/AvatarForm';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const CreateAvatarPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Avatar</h1>
      <AvatarForm />
    </div>
  );
};

export default CreateAvatarPage;
