import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
        Welcome to NammaQA Admin
      </h1>
      <p className="text-gray-400 text-lg mb-8 text-center max-w-2xl">
        Manage your meetups, workshops, special events, blogs, success stories, gallery images, newsletter subscribers, and contact messages from the sidebar. 
        Select a category to view, create, edit, or delete records.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Placeholder cards for aesthetics */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">Events</div>
          <div className="text-gray-400">Manage all NConnect events</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">Content</div>
          <div className="text-gray-400">Update blogs and stories</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center col-span-2 md:col-span-1">
          <div className="text-3xl font-bold text-gray-900 mb-2">Media</div>
          <div className="text-gray-400">Upload to gallery</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center col-span-2 md:col-span-3">
          <div className="text-3xl font-bold text-gray-900 mb-2">Newsletter</div>
          <div className="text-gray-400">Review and manage subscriber emails</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center col-span-2 md:col-span-3">
          <div className="text-3xl font-bold text-gray-900 mb-2">Message Us</div>
          <div className="text-gray-400">Track and respond to inbound contact requests</div>
        </div>
      </div>
    </div>
  );
}
