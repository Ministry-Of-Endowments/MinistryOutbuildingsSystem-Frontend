import React, { useState } from "react";
import { apiFetch } from "../utils/api";

export default function AddMosquePage() {
  const [form, setForm] = useState({
    name: "",
    directorate: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      const res = await apiFetch("/Mosques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
          <input
            type="text"
            name="directorate"
            value={form.directorate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
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
          <label className="block mb-1 font-semibold">الملاحظات</label>
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
