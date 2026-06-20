import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { hourly_rate, tax_percentage, km_deduction_rate, custom_deductions } = await request.json();
  if (hourly_rate && hourly_rate < 0) {
    return NextResponse.json({ error: 'Invalid hourly_rate', code: 'VALIDATION_ERROR' }, { status: 422 });
  }
  const { data, error } = await supabase
    .from('job_types')
    .update({ hourly_rate, tax_percentage, km_deduction_rate, custom_deductions })
    .eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 200 });
}
