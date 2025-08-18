import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('Midtrans webhook received:', body)

    const {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      gross_amount,
      transaction_time,
      signature_key
    } = body

    // Verify signature (optional but recommended)
    // const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')
    // const expectedSignature = await crypto.subtle.digest(
    //   'SHA-512',
    //   new TextEncoder().encode(`${order_id}${status_code}${gross_amount}${serverKey}`)
    // )

    let paymentStatus = 'pending'
    
    // Map Midtrans status to our payment status
    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        paymentStatus = 'pending'
      } else if (fraud_status === 'accept') {
        paymentStatus = 'completed'
      }
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'completed'
    } else if (transaction_status === 'cancel' || 
               transaction_status === 'deny' || 
               transaction_status === 'expire') {
      paymentStatus = 'failed'
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending'
    }

    // Update registration payment status
    const { data, error } = await supabaseClient
      .from('registrations')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select()

    if (error) {
      console.error('Error updating registration:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update registration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Registration updated:', data)

    return new Response(
      JSON.stringify({ 
        message: 'Webhook processed successfully',
        order_id,
        status: paymentStatus
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})