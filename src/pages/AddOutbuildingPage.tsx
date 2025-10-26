import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

type Mosque = {
  id: number;
  name: string;
  directorate: string;
  address: string;
};

export default function AddOutbuildingPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    type: "",
    price: "",
    space: "",
    notes: "",
    mosqueId: "",
  });
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMosques, setLoadingMosques] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchMosques();
  }, []);

  async function fetchMosques() {
    setLoadingMosques(true);
    try {
      const res = await apiFetch('/Mosques');
      const data = await res.json();
      
      if (data.status === 'success') {
        setMosques(data.data || []);
      } else {
        setMosques([]);
      }
    } catch (err) {
      console.error('Failed to fetch mosques:', err);
      setMosques([]);
    } finally {
      setLoadingMosques(false);
    }
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
      const basicPayload = {
        name: form.name,
        address: form.address,
        type: parseInt(form.type),
        price: parseFloat(form.price),
        space: parseFloat(form.space),
        notes: form.notes,
      };
      
      const res = await apiFetch(`/Outbuildings/${form.mosqueId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(basicPayload),
      });
      const data = await res.json();
      
      if (data.status === "success") {
        setMessage({ type: "success", text: "تم إضافة الملحق بنجاح" });
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
    <div className="h-screen overflow-y-auto p-4">
      <div className="max-w-7xl mx-auto text-right">
        {message && (                                           
          <div
            className={`mb-4 p-3 rounded text-white ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-6"
        >
        <div>
          <label className="block mb-1 font-semibold">المسجد</label>
          <select
            name="mosqueId"
            value={form.mosqueId}
            onChange={handleChange}
            required
            disabled={loadingMosques}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">
              {loadingMosques ? "جاري التحميل..." : "اختر المسجد"}
            </option>
            {mosques.map((mosque) => (
              <option key={mosque.id} value={mosque.id}>
                {mosque.name} - {mosque.directorate}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">اسم الملحق</label>
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

        <div>
          <label className="block mb-1 font-semibold">النوع</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">اختر النوع</option>
            <option value="0">محل</option>
            <option value="1">شقة</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">السعر</label>
          <input
            type="text"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">المساحة</label>
          <input
            type="text"
            name="space"
            value={form.space}
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
            {loading ? "جارٍ الحفظ..." : "إضافة ملحق"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
