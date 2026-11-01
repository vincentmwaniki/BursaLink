import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { applicationId, amount, schoolAccount } = await req.json()

    // 1. Simulate M-Pesa API Call (e.g., STK Push)
    // In a real scenario, you'd call Daraja API here
    const mpesaResponse = {
      MerchantRequestID: "123-456",
      ResponseCode: "0",
      ResponseDescription: "Success"
    }

    if (mpesaResponse.ResponseCode === "0") {
      // 2. Log Payment in DB
      const { data, error } = await supabase
        .from('payments')
        .insert({
          application_id: applicationId,
          amount: amount,
          school_account: schoolAccount,
          status: 'completed',
          transaction_id: `MPESA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paid_at: new Date().toISOString()
        })
        .select()

      if (error) throw error

      // 3. Update Application Status
      await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId)

      return new Response(JSON.stringify({ success: true, payment: data[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      throw new Error("M-Pesa transaction failed")
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})