import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Trophy, 
  Image as ImageIcon, 
  LogOut,
  FileText
} from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-400 mt-1">Welcome, {session?.user?.name || "Admin"}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white group">
                <LayoutDashboard className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Dashboard</span>
              </Link>
            </li>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              NConnect
            </div>
            <li>
              <Link href="/admin/meetup" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white group">
                <Users className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                <span>Meetups</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/workshop" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white group">
                <Calendar className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span>Workshops</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/special-events" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white group">
                <Trophy className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                <span>Special Events</span>
              </Link>
            </li>
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Content
            </div>
            <li>
              <Link href="/admin/blogs" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white group">
                <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Blogs</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/success-stories" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white group">
                <Trophy className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span>Success Stories</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/gallery" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white group">
                <ImageIcon className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                <span>Gallery</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-900/50 relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
        <div className="p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
