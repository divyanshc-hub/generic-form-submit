import { useEffect, useState } from "react";
import { getFormByIdentifiers, createRegistration } from "./services/formService";

export default function App() {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const tenantId = import.meta.env.VITE_TENANT_ID as string;
  const projectId = import.meta.env.VITE_PROJECT_ID as string;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getFormByIdentifiers("Registration"); // formName
        setForm(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container">Loading...</div>;
  if (!form) return <div className="container">No form found</div>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;
    try {
      setSubmitting(true);
      const fd = new FormData(e.currentTarget);
      const data: Record<string, any> = {};
      for (const f of form.fields || []) {
        const fieldId = f.fieldId;
        const label = f.label || fieldId;
        const options =
          Array.isArray(f.options)
            ? f.options.map((o: any) => String(o).trim()).filter((o: string) => o.length > 0)
            : [];
        if (f.fieldType === "checkbox") {
          if (options.length > 0) {
            data[label] = fd.getAll(fieldId); // array of selected options
          } else {
            data[label] = fd.get(fieldId) === "on"; // boolean
          }
        } else if (f.fieldType === "radio") {
          data[label] = fd.get(fieldId) ?? null;
        } else if (f.fieldType === "file") {
          const file = fd.get(fieldId) as File | null;
          data[label] = file instanceof File ? file.name : null; // sending filename only
        } else {
          data[label] = fd.get(fieldId) ?? "";
        }
      }
      const payload = {
        tenantId,
        projectId,
        formName: form.formName,
        formData: data,
      };
      const res = await createRegistration(payload);
      alert(res?.message || "Registration submitted successfully");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='container'>
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2 className="formTitle">{form.formName}</h2>
        {form.fields?.map((f: any) => {
          const requiredMark = f.requiredField ? <span style={{ color: "#dc2626" }}>*</span> : null;
          const options =
            Array.isArray(f.options)
              ? f.options.map((o: any) => String(o).trim()).filter((o: string) => o.length > 0)
              : [];
          return (
            <div key={f.fieldId} className="formGroup">
              <label className="label">
                {f.label} {requiredMark}
              </label>
              {["text", "email", "password", "date", "number"].includes(f.fieldType) ? (
                <input
                  type={f.fieldType}
                  className="input"
                  placeholder={f.placeholder}
                  required={f.requiredField}
                  name={f.fieldId}
                />
              ) : f.fieldType === "textarea" ? (
                <textarea
                  className="textarea"
                  placeholder={f.placeholder}
                  required={f.requiredField}
                  name={f.fieldId}
                />
              ) : f.fieldType === "dropdown" ? (
                <select className="select" required={f.requiredField} name={f.fieldId}>
                  {options.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : f.fieldType === "checkbox" ? (
                <div className="controlGroup">
                  {options.length > 0 ? (
                    options.map((opt: string) => (
                      <label key={opt} className="control">
                        <input type="checkbox" value={opt} name={f.fieldId} /> {opt}
                      </label>
                    ))
                  ) : (
                    <label className="control">
                      <input type="checkbox" name={f.fieldId} /> {f.label}
                    </label>
                  )}
                </div>
              ) : f.fieldType === "radio" ? (
                <div className="controlGroup">
                  {options.map((opt: string) => (
                    <label key={opt} className="control">
                      <input type="radio" name={f.fieldId} value={opt} /> {opt}
                    </label>
                  ))}
                </div>
              ) : f.fieldType === "file" ? (
                <input type="file" className="input" name={f.fieldId} />
              ) : (
                <input className="input" placeholder={f.placeholder} required={f.requiredField} name={f.fieldId} />
              )}
            </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button type="submit" className="primaryBtn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}