export interface JobType {
  id: string;
  user_id: string;
  name: string;
  preset: 'uber' | 'bolt' | 'contract' | 'freelance' | 'custom';
  fields: any[]; // existing field definitions
  reminder_threshold_hours?: number;
  // Phase 2 extensions
  hourly_rate?: number;
  tax_percentage?: number;
  km_deduction_rate?: number;
  custom_deductions?: Record<string, unknown>;
}
