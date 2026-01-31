import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

let blogs = [
  { id: '1', title: 'First Post', content: 'This is the first blog post.', publishedDate: '2025-07-28' },
  { id: '2', title: 'Second Post', content: 'This is the second blog post.', publishedDate: '2025-07-27' },
];

export async function GET() {
  return NextResponse.json(blogs);
}

export async function POST(request: Request) {
  const { title, content } = await request.json();
  const newBlog = {
    id: Math.random().toString(),
    title,
    content,
    publishedDate: new Date().toISOString().split('T')[0],
  };
  blogs.push(newBlog);
  return NextResponse.json(newBlog, { status: 201 });
}
