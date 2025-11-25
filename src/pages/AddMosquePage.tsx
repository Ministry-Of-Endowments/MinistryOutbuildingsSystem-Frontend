import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

type Administration = {
  id: number;
  name: string;
};

type Directorate = {
  id: number;
  name: string;
  administrations: Administration[];
};

export default function AddMosquePage() {
  const [form, setForm] = useState({
    name: "",
    directorateName: "",
    administrationId: "",
    address: "",
    notes: "",
  });
  const [directorates, setDirectorates] = useState<Directorate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchDirectorates();
  }, []);

  async function fetchDirectorates() {
    try {
      const res = await apiFetch('/Outbuildings/Directorates/WithAdministrations');
      const data = await res.json();
      if (data.status === 'success') {
        const sorted = (data.data || []).map((dir: Directorate) => ({
          ...dir,
          administrations: [...dir.administrations].sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        })).sort((a: Directorate, b: Directorate) => a.name.localeCompare(b.name, 'ar'));
        setDirectorates(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch directorates:', err);
    }
  }

  const selectedDirectorate = directorates.find(d => d.name === form.directorateName);
  const availableAdministrations = selectedDirectorate?.administrations || [];

  function handleDirectorateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const directorate = e.target.value;
    setForm({ ...form, directorateName: directorate, administrationId: "" });
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        name: form.name,
        administrationId: parseInt(form.administrationId),
        address: form.address,
        notes: form.notes,
        Directorate: form.directorateName,
      };
      
      const res = await apiFetch("/Mosques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === "success") {
        setMessage({ type: "success", text: " تم إنشاء المسجد بنجاح" });
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "حدث خطأ أثناء الإضافة" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "فشل الاتصال بالسيرفر" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto text-right">
      {/* Managed by ManagerLayout header */}

      {/* رسالة التنبيه */}
      {message && (
        <div
          className={`mb-4 p-3 rounded text-white ${
            message.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block mb-1 font-semibold">اسم المسجد</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">المديرية</label>
          <select
            name="directorateName"
            value={form.directorateName}
            onChange={handleDirectorateChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">اختر المديرية</option>
            {directorates.map((dir) => (
              <option key={dir.id} value={dir.name}>
                {dir.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block mb-1 font-semibold ${!form.directorateName ? 'text-gray-400' : ''}`}>الإدارة</label>
          <select
            name="administrationId"
            value={form.administrationId}
            onChange={handleChange}
            required
            disabled={!form.directorateName}
            className={`w-full border rounded px-3 py-2 ${!form.directorateName ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
          >
            <option value="">اختر الإدارة</option>
            {availableAdministrations.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-full">
          <label className="block mb-1 font-semibold">العنوان</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="col-span-full">
          <label className="block mb-1 font-semibold">الملاحظات (اختياري)</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="col-span-full flex justify-end gap-3 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-(--primary) text-white rounded hover:opacity-90"
          >
            {loading ? "جارٍ الحفظ..." : "إضافة مسجد"}
          </button>
        </div>
      </form>
    </div>
  );
}
