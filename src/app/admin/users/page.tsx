"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  User,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  two_factor_enabled: boolean;
  last_login_at?: string;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CONTENT_ADMIN",
    status: "ACTIVE",
    disable2FA: false,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success) {
        setUsers(json.data || []);
      }
    } catch (e) {
      console.error("Error loading users:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "CONTENT_ADMIN",
      status: "ACTIVE",
      disable2FA: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (u: AdminUserRecord) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role || "CONTENT_ADMIN",
      status: u.status || "ACTIVE",
      disable2FA: false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        setModalOpen(false);
        await fetchUsers();
      } else {
        alert(json.error?.message || "Failed to save user.");
      }
    } catch {
      alert("Failed to save user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(json.error?.message || "Failed to delete user.");
      }
    } catch {
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-[#fcb907]" />
            <span>Admin Users & Role Permissions</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Manage administrative team members, assign access tiers (Super Admin, Content Admin, Sales), and enforce 2FA compliance.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New User</span>
        </button>
      </div>

      {/* Role Definitions Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#e7e9ee] space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
            SUPER_ADMIN
          </span>
          <p className="text-xs font-bold text-[#101114] pt-1">Full System Control</p>
          <p className="text-[11px] text-[#6b7280]">All CMS, Orders, Financials, User Roles, Security 2FA, and Activity Logs.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#e7e9ee] space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900">
            CONTENT_ADMIN
          </span>
          <p className="text-xs font-bold text-[#101114] pt-1">Content & Catalog Editor</p>
          <p className="text-[11px] text-[#6b7280]">Models, Collections, Blogs, Media, Reviews, FAQs, SEO, and Page Sections.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#e7e9ee] space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
            SALES
          </span>
          <p className="text-xs font-bold text-[#101114] pt-1">Inbound CRM Pipeline</p>
          <p className="text-[11px] text-[#6b7280]">Customer Leads, Quote Configurator Submissions, Follow-ups, and Notes.</p>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-24 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
          <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
          <span>Loading admin users...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-[20px] p-16 text-center text-[#6b7280] text-xs border border-[#e7e9ee] font-medium shadow-xs">
          No admin users found.
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e7e9ee] text-[#6b7280] font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Name & Email</th>
                  <th className="py-3.5 px-4">Role Tier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">2FA Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e9ee]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#fcfcfd] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#101114]">{u.name}</div>
                      <div className="text-[11px] font-mono text-[#6b7280]">{u.email}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[#101114] text-[11px]">
                        {u.role || "SUPER_ADMIN"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                        {u.two_factor_enabled ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-[#6b7280]">Disabled</span>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#b45309] hover:bg-amber-50 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 space-y-5 border border-[#e7e9ee] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-4">
              <h3 className="text-lg font-bold text-[#101114] font-serif">
                {editingUser ? "Edit User & Role" : "Create New Admin User"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6b7280] hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  placeholder="name@modularhome.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  {editingUser ? "Reset Password (leave empty to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? "••••••••" : "Strong password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                    Role Tier
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-bold"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Full Access)</option>
                    <option value="CONTENT_ADMIN">CONTENT_ADMIN (CMS & Catalog)</option>
                    <option value="SALES">SALES (Leads & Quotes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-bold"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {editingUser && editingUser.two_factor_enabled && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900">
                    <input
                      type="checkbox"
                      checked={form.disable2FA}
                      onChange={(e) => setForm({ ...form, disable2FA: e.target.checked })}
                      className="rounded border-amber-300 text-[#d97706] focus:ring-[#fcb907]"
                    />
                    <span>Reset/Disable 2FA for this user</span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e7e9ee]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e7e9ee] text-xs font-bold text-[#6b7280] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
