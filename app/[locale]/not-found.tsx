import Link from 'next/link';
 
export default async function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
        <p className="text-2xl font-medium text-gray-600 dark:text-gray-400 mt-4">Page Not Found</p>
        <p className="text-lg text-gray-500 dark:text-gray-300 mt-2">
          Sorry, the page you are looking for does not exist.
        </p>
        <div className="mt-8">
          <Link href="/" className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
