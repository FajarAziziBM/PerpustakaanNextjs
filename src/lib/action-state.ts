export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export const emptyActionState: ActionState = {};
