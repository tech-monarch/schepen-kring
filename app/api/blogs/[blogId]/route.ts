import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return [
    { blogId: '1' },
    { blogId: '2' },
  ];
}

let blogs = [
  { id: '1', title: 'First Post', content: 'This is the first blog post.', publishedDate: '2025-07-28' },
  { id: '2', title: 'Second Post', content: 'This is the second blog post.', publishedDate: '2025-07-27' },
];

export async function PUT(request: Request, context: any) {
  const { blogId } = context.params;
  const { title, content } = await request.json();
  const blogIndex = blogs.findIndex((blog) => blog.id === blogId);

  if (blogIndex === -1) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  blogs[blogIndex] = { ...blogs[blogIndex], title, content };
  return NextResponse.json(blogs[blogIndex]);
}

export async function DELETE(request: Request, context: any) {
  const { blogId } = context.params;
  blogs = blogs.filter((blog) => blog.id !== blogId);
  return new NextResponse(null, { status: 204 });
}