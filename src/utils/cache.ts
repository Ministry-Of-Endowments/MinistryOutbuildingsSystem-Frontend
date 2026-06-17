import { apiFetch } from './api';
import type { Directorate, Governorate, Department, Sheikhdom, PurposeOption } from './types';

// Module-level cache so all components share one fetch per session
let purposesCache: PurposeOption[] | null = null;
let directoratesCache: Directorate[] | null = null;
let governoratesCache: Governorate[] | null = null;
let purposesPromise: Promise<PurposeOption[]> | null = null;
let directoratesPromise: Promise<Directorate[]> | null = null;
let governoratesPromise: Promise<Governorate[]> | null = null;

export async function fetchPurposesCached(): Promise<PurposeOption[]> {
  if (purposesCache) return purposesCache;
  if (purposesPromise) return purposesPromise;
  purposesPromise = apiFetch('/Outbuildings/purposes')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        purposesCache = data.data || [];
        return purposesCache!;
      }
      return [];
    })
    .catch(() => [])
    .finally(() => { purposesPromise = null; });
  return purposesPromise;
}

export async function fetchGovernoratesCached(): Promise<Governorate[]> {
  if (governoratesCache) return governoratesCache;
  if (governoratesPromise) return governoratesPromise;
  governoratesPromise = apiFetch('/Outbuildings/Governorates/WithDepartmentsAndSheikhdoms')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        const sorted = (data.data || []).map((gov: Governorate) => ({
          ...gov,
          departments: gov.departments.map((dept: Department) => ({
            ...dept,
            sheikhdoms: [...dept.sheikhdoms].sort((a: Sheikhdom, b: Sheikhdom) => a.name.localeCompare(b.name, 'ar')),
          })).sort((a: Department, b: Department) => a.name.localeCompare(b.name, 'ar')),
        })).sort((a: Governorate, b: Governorate) => a.name.localeCompare(b.name, 'ar'));
        governoratesCache = sorted;
        return governoratesCache!;
      }
      return [];
    })
    .catch(() => [])
    .finally(() => { governoratesPromise = null; });
  return governoratesPromise;
}

export async function fetchDirectoratesCached(): Promise<Directorate[]> {
  if (directoratesCache) return directoratesCache;
  if (directoratesPromise) return directoratesPromise;
  directoratesPromise = apiFetch('/Outbuildings/Directorates/WithAdministrations')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        const sorted = (data.data || []).map((dir: Directorate) => ({
          ...dir,
          administrations: [...dir.administrations].sort((a, b) =>
            a.name.localeCompare(b.name, 'ar')
          ),
        })).sort((a: Directorate, b: Directorate) => a.name.localeCompare(b.name, 'ar'));
        directoratesCache = sorted;
        return directoratesCache!;
      }
      return [];
    })
    .catch(() => [])
    .finally(() => { directoratesPromise = null; });
  return directoratesPromise;
}
