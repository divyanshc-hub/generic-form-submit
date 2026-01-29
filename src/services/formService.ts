import api from "../api";

type GetFormRequest = {
  tenantId: string;
  projectId: string;
  formName: string;
};

export async function getFormByIdentifiers(formName: string) {
  const tenantId = import.meta.env.VITE_TENANT_ID as string;
  const projectId = import.meta.env.VITE_PROJECT_ID as string;

  const payload: GetFormRequest = { tenantId, projectId, formName };
  console.log(payload,'payload');
  const res = await api.post("/api/v1/admin/formBuilder/getFormByIdentifiers", payload);
  return res.data.data; // IFormProject
}

type CreateRegistrationPayload = {
  tenantId: string;
  projectId: string;
  formName: string;
  formData: Record<string, any>;
};

export async function createRegistration(payload: CreateRegistrationPayload) {
  const res = await api.post("/api/v1/admin/registrations/createRegistration", payload);
  return res.data;
}