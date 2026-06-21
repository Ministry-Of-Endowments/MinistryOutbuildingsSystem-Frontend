import { useEffect, useState } from 'react';
import { fetchGovernoratesCached } from '../utils/cache';
import type { Governorate } from '../utils/types';

interface AddressFieldsProps {
  governorateId: number | string;
  departmentId: number | string;
  sheikhdomId: number | string;
  street?: string;
  onGovernorateChange: (governorateId: number | string) => void;
  onDepartmentChange: (departmentId: number | string) => void;
  onSheikhdomChange: (sheikhdomId: number | string) => void;
  onStreetChange: (street: string) => void;
  required?: boolean;
  streetRequired?: boolean;
  disabled?: boolean;
  governorateDisabled?: boolean;
  readonlyLookups?: boolean;
}

export default function AddressFields({
  governorateId,
  departmentId,
  sheikhdomId,
  street = '',
  onGovernorateChange,
  onDepartmentChange,
  onSheikhdomChange,
  onStreetChange,
  required = true,
  streetRequired,
  disabled = false,
  governorateDisabled = false,
  readonlyLookups = false,
}: AddressFieldsProps) {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGovernorates();
  }, []);

  async function fetchGovernorates() {
    setLoading(true);
    try {
      const data = await fetchGovernoratesCached();
      setGovernorates(data);
    } catch (e) {
      console.error('Failed to fetch governorates:', e);
    } finally {
      setLoading(false);
    }
  }

  const selectedGovernorate = governorates.find(g => g.id === Number(governorateId));
  const availableDepartments = selectedGovernorate?.departments || [];
  
  const selectedDepartment = availableDepartments.find(d => d.id === Number(departmentId));
  const availableSheikhdoms = selectedDepartment?.sheikhdoms || [];

  function handleGovernorateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onGovernorateChange(e.target.value);
  }

  function handleDepartmentChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    onDepartmentChange(value);
  }

  function handleSheikhdomChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    onSheikhdomChange(value);
  }

  function handleStreetChange(e: React.ChangeEvent<HTMLInputElement>) {
    onStreetChange(e.target.value);
  }

  const isStreetRequired = streetRequired ?? required;

  if (loading) {
    return <div className="text-center py-4">جاري تحميل المواقع...</div>;
  }

  return (
    <>
      <div className="relative z-30">
        <label className="block mb-1 font-semibold text-sm">
          المحافظة {required && !readonlyLookups && <span className="text-red-500">*</span>}
        </label>
        {readonlyLookups ? (
          <input
            type="text"
            readOnly
            value={selectedGovernorate?.name || ''}
            className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-default"
          />
        ) : (
          <select
            value={governorateId}
            onChange={handleGovernorateChange}
            className="w-full p-2 border rounded cursor-pointer"
            required={required}
            disabled={disabled || governorateDisabled}
          >
            <option value="">-- اختر المحافظة --</option>
            {governorates.map((gov) => (
              <option key={gov.id} value={gov.id}>
                {gov.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="relative z-20">
        <label className="block mb-1 font-semibold text-sm">
          القسم {required && !readonlyLookups && <span className="text-red-500">*</span>}
        </label>
        {readonlyLookups ? (
          <input
            type="text"
            readOnly
            value={selectedDepartment?.name || ''}
            className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-default"
          />
        ) : (
          <select
            value={departmentId}
            onChange={handleDepartmentChange}
            className="w-full p-2 border rounded cursor-pointer"
            required={required}
            disabled={disabled || !governorateId}
          >
            <option value="">-- اختر القسم --</option>
            {availableDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="relative z-10">
        <label className="block mb-1 font-semibold text-sm">
          الشياخة {required && !readonlyLookups && <span className="text-red-500">*</span>}
        </label>
        {readonlyLookups ? (
          <input
            type="text"
            readOnly
            value={availableSheikhdoms.find(s => s.id === Number(sheikhdomId))?.name || ''}
            className="w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-default"
          />
        ) : (
          <select
            value={sheikhdomId}
            onChange={handleSheikhdomChange}
            className="w-full p-2 border rounded cursor-pointer"
            required={required}
            disabled={disabled || !departmentId}
          >
            <option value="">-- اختر الشياخة --</option>
            {availableSheikhdoms.map((shk) => (
              <option key={shk.id} value={shk.id}>
                {shk.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block mb-1 font-semibold text-sm">
          الشارع {isStreetRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={street}
          onChange={handleStreetChange}
          className="w-full p-2 border rounded"
          placeholder="أدخل اسم الشارع"
          required={isStreetRequired}
          disabled={disabled}
        />
      </div>
    </>
  );
}
