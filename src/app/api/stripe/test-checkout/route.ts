import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  console.log('🧪 FAKE STRIPE: Processing test payment...')
  
  try {
    const { userId, credits } = await request.json()

    if (!userId || !credits) {
      return NextResponse.json(
        { error: 'userId and credits are required' },
        { status: 400 }
      )
    }

    console.log(`🧪 FAKE STRIPE: Simulating payment for user ${userId}, adding ${credits} credits`)

    // PREVENT RAPID TEST PAYMENTS - Allow max 1 test payment per minute per user
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    
    const { data: recentTestPayment } = await supabaseAdmin
      .from('processed_events')
      .select('id, processed_at')
      .eq('user_id', userId)
      .eq('source', 'test')
      .gte('processed_at', oneMinuteAgo)
      .single()

    if (recentTestPayment) {
      console.log('🚫 BLOCKED: Test payment blocked - user already made a test payment within 1 minute')
      return NextResponse.json(
        { 
          error: 'Please wait at least 1 minute between test payments',
          blocked: true,
          reason: 'rate_limit',
          lastTestPayment: recentTestPayment.processed_at
        },
        { status: 429 }
      )
    }

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Add credits directly (simulate successful payment)
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const currentCredits = userData?.credits || 0
    const newCredits = currentCredits + credits
    
    console.log(`💰 FAKE STRIPE: Updating credits: ${currentCredits} + ${credits} = ${newCredits}`)
    
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating credits:', updateError)
      return NextResponse.json(
        { error: 'Failed to update credits' },
        { status: 500 }
      )
    }

    // Record this test payment to prevent rapid duplicates
    const testSessionId = `test_${userId}_${Date.now()}`
    await supabaseAdmin
      .from('processed_events')
      .insert({
        stripe_session_id: testSessionId,
        user_id: userId,
        credits_added: credits,
        processed_at: new Date().toISOString(),
        source: 'test'
      })

    console.log(`✅ FAKE STRIPE: Successfully processed fake payment! User ${userId} now has ${newCredits} credits`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Fake payment processed successfully',
      newCredits: newCredits,
      simulatedPayment: true
    })
  } catch (error) {
    console.error('💥 FAKE STRIPE error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
} 