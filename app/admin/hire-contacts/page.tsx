"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import DataTable from "../components/DataTable";

type HireContactItem = {
  id: number;
  firstName: string;
  lastName: string;
  organizationName: string;
  phoneNumber: string;
  emailAddress: string;
  createdAt: string;
  updatedAt: string;
};

export default function HireContactsPage() {
  const [data, setData] = useState<HireContactItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/hire-contacts");
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Error fetching hire contacts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchItems();
  }, []);

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "organizationName", label: "Organization" },
    { key: "emailAddress", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    {
      key: "createdAt",
      label: "Date",
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-indigo-600" />
            Hire Contacts
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            View and manage hiring inquiries submitted from the website.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading hire contacts...</div>
        ) : (
          <DataTable columns={columns} data={data} actions={[]} />
        )}
      </div>
    </div>
  );
}
