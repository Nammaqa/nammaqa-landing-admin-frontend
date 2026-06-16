export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-4">NammaQA Landing</h1>
      <p className="text-xl text-gray-400">The public landing page is currently under construction.</p>
      <a href="/admin" className="mt-8 text-blue-400 hover:text-blue-300 underline">
        Go to Admin Dashboard
      </a>
    </div>
  );
}
