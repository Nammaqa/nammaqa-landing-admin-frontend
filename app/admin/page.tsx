import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  const [meetupCount, workshopCount, specialEventCount, blogCount, galleryCount, successStoryCount, newsletterCount, contactCount] = await Promise.all([
    (db as any).NConnect.count({ where: { meeting_type: "meetup" } }),
    (db as any).NConnect.count({ where: { meeting_type: "workshop" } }),
    (db as any).NConnect.count({ where: { meeting_type: "special_events" } }),
    (db as any).Blog.count(),
    (db as any).Gallery.count(),
    (db as any).SuccessStory.count(),
    (db as any).NewsletterSubscription.count(),
    (db as any).ContactMessage.count(),
  ]);

  const stats = [
    { label: "Meetups", count: meetupCount, color: "from-sky-500 to-cyan-500" },
    { label: "Workshops", count: workshopCount, color: "from-violet-500 to-purple-500" },
    { label: "Special Events", count: specialEventCount, color: "from-amber-500 to-orange-500" },
    { label: "Blogs", count: blogCount, color: "from-emerald-500 to-green-500" },
    { label: "Gallery", count: galleryCount, color: "from-pink-500 to-rose-500" },
    { label: "Success Stories", count: successStoryCount, color: "from-indigo-500 to-blue-500" },
    { label: "Newsletter", count: newsletterCount, color: "from-fuchsia-500 to-pink-500" },
    { label: "Contact Messages", count: contactCount, color: "from-slate-600 to-slate-500" },
  ];

  const maxCount = Math.max(...stats.map((item) => item.count), 1);
  const totalRecords = stats.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to NammaQA Admin</h1>
        <p className="mt-2 text-sm text-gray-600">
          Here is a live summary of your content and event records from the database.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Dashboard overview</h2>
            <p className="text-sm text-gray-500">Counts based on the actual data currently stored.</p>
          </div>
          <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            {totalRecords} total records
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const width = Math.max(8, (item.count / maxCount) * 100);
            return (
              <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                  </div>
                  <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${item.color}`} />
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-200">
                  <div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick access</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Manage events, blogs, gallery, and stories from the sidebar.
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Use the counts above to monitor content growth and engagement at a glance.
          </div>
        </div>
      </div>
    </div>
  );
}
