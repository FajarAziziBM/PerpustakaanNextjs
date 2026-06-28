"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/action-state";

export type FieldConfig =
  | {
      type: "text" | "email" | "number" | "password";
      name: string;
      label: string;
      required?: boolean;
      placeholder?: string;
      step?: string;
      helpText?: string;
    }
  | {
      type: "select";
      name: string;
      label: string;
      required?: boolean;
      options: { value: string; label: string }[];
      helpText?: string;
    }
  | {
      type: "textarea";
      name: string;
      label: string;
      required?: boolean;
      helpText?: string;
    };

interface EntityFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: FieldConfig[];
  defaultValues?: Record<string, string | number | null | undefined>;
  submitLabel?: string;
  hiddenFields?: Record<string, string | number>;
}

const initialState: ActionState = {};

const inputClass =
  "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

export function EntityForm({
  action,
  fields,
  defaultValues = {},
  submitLabel = "Simpan",
  hiddenFields = {},
}: EntityFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {state.message && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      )}

      {fields.map((field) => {
        const fieldErrors = state.errors?.[field.name];
        const defaultValue = defaultValues[field.name] ?? "";

        return (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-slate-700">
              {field.label}
            </label>

            {field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                required={field.required}
                defaultValue={String(defaultValue)}
                className={inputClass}
              >
                <option value="">— Pilih —</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                defaultValue={String(defaultValue)}
                rows={3}
                className={inputClass}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                step={field.step}
                placeholder={field.placeholder}
                defaultValue={String(defaultValue)}
                className={inputClass}
              />
            )}

            {field.helpText && !fieldErrors && (
              <p className="mt-1 text-xs text-slate-400">{field.helpText}</p>
            )}
            {fieldErrors && fieldErrors.length > 0 && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors[0]}</p>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
