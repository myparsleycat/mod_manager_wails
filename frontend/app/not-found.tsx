import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <FileQuestion size={48} className="text-gray-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">404: Page Not Found</h1>
      <p className="text-gray-600 mb-4">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}

export default NotFoundPage