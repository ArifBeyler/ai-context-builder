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
  try {
    const { userId, credits, action, paymentSessionId, source } = await request.json()

    if (!userId || (credits === undefined && action !== 'reset' && action !== 'check')) {
      return NextResponse.json(
        { error: 'userId and credits are required' },
        { status: 400 }
      )
    }

    console.log(`🔧 DEBUG: Processing action "${action}" for user ${userId}${source ? ` (source: ${source})` : ''}`)

    // If this is just a check action, only verify if payment was processed
    if (action === 'check' && paymentSessionId) {
      console.log(`🔍 Checking if payment session was already processed: ${paymentSessionId}`)
      
      const { data: existingPayment, error: paymentError } = await supabaseAdmin
        .from('processed_events')
        .select('id, credits_added, processed_at')
        .eq('stripe_session_id', paymentSessionId)
        .eq('user_id', userId)
        .single()

      if (existingPayment) {
        console.log('✅ Payment session already processed:', existingPayment)
        return NextResponse.json({ 
          success: true, 
          message: 'Payment already processed',
          alreadyProcessed: true,
          processedAt: existingPayment.processed_at,
          creditsAdded: existingPayment.credits_added
        })
      } else {
        console.log('❌ Payment session not found in processed events')
        return NextResponse.json({ 
          success: true, 
          message: 'Payment not processed yet',
          alreadyProcessed: false
        })
      }
    }

    // If this is a payment-related credit addition, check for duplicates
    if (paymentSessionId && action === 'add') {
      console.log(`💳 Payment session detected: ${paymentSessionId}`)
      
      // Check if we already processed this payment session
      const { data: existingPayment, error: paymentError } = await supabaseAdmin
        .from('processed_events')
        .select('id, credits_added, processed_at')
        .eq('stripe_session_id', paymentSessionId)
        .eq('user_id', userId)
        .single()

      if (existingPayment) {
        console.log('⚠️ Payment session already processed, skipping credit addition:', paymentSessionId)
        
        // Still return current user credits
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('credits')
          .eq('id', userId)
          .single()
        
        return NextResponse.json({ 
          success: true, 
          message: 'Payment already processed',
          newTotal: userData?.credits || 0,
          alreadyProcessed: true,
          previouslyAdded: existingPayment.credits_added,
          processedAt: existingPayment.processed_at
        })
      }

      if (paymentError && paymentError.code !== 'PGRST116') {
        console.error('❌ Error checking processed payments:', paymentError)
        // Continue processing but log the error
      }
    }

    // First, try to get current user credits using admin client
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    let currentCredits = 0
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // User doesn't exist, create it using admin client
        console.log('🆕 User not found, creating new user record...')
        const { error: createError } = await supabaseAdmin
          .from('users')
          .insert({
            id: userId,
            anonymous_id: userId,
            credits: action === 'reset' ? 1 : credits,
          })

        if (createError) {
          console.error('❌ Error creating user:', createError)
          return NextResponse.json(
            { error: 'Failed to create user: ' + createError.message },
            { status: 500 }
          )
        }

        const newTotal = action === 'reset' ? 1 : credits
        console.log(`✅ DEBUG: Created new user ${userId} with ${newTotal} credits`)
        
        // Record payment session if applicable
        if (paymentSessionId && action === 'add') {
          await supabaseAdmin
            .from('processed_events')
            .insert({
              stripe_session_id: paymentSessionId,
              user_id: userId,
              credits_added: credits,
              processed_at: new Date().toISOString(),
              source: source || 'unknown'
            })
          console.log('📝 Payment session recorded for new user:', paymentSessionId)
        }
        
        return NextResponse.json({ 
          success: true, 
          message: `Created user with ${newTotal} credits`,
          newTotal: newTotal
        })
      } else {
        console.error('❌ Error fetching user:', fetchError)
        return NextResponse.json(
          { error: 'User fetch error: ' + fetchError.message },
          { status: 500 }
        )
      }
    }

    // User exists, update credits using admin client
    currentCredits = userData?.credits || 0
    
    let newCredits
    if (action === 'reset') {
      newCredits = 1
      console.log(`🔄 DEBUG: Resetting credits to 1 for user ${userId}`)
    } else if (action === 'set') {
      newCredits = credits
      console.log(`📝 DEBUG: Setting credits to ${credits} for user ${userId}`)
    } else {
      newCredits = currentCredits + credits
      console.log(`💰 DEBUG: Updating credits: ${currentCredits} + ${credits} = ${newCredits}`)
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating credits:', updateError)
      return NextResponse.json(
        { error: 'Failed to update credits: ' + updateError.message },
        { status: 500 }
      )
    }

    // Record payment session if applicable
    if (paymentSessionId && action === 'add') {
      const { error: recordError } = await supabaseAdmin
        .from('processed_events')
        .insert({
          stripe_session_id: paymentSessionId,
          user_id: userId,
          credits_added: credits,
          processed_at: new Date().toISOString(),
          source: source || 'unknown'
        })

      if (recordError) {
        console.error('⚠️ Failed to record payment session:', recordError)
        // Don't fail the API just because we couldn't record the session
      } else {
        console.log('📝 Payment session recorded:', paymentSessionId, `(source: ${source || 'unknown'})`)
      }
    }

    const actionMsg = action === 'reset' ? 'Reset credits to 1' : action === 'set' ? `Set credits to ${credits}` : `Added ${credits} credits`
    console.log(`✅ DEBUG: ${actionMsg} for user ${userId}. New total: ${newCredits}`)
    
    return NextResponse.json({ 
      success: true, 
      message: actionMsg,
      newTotal: newCredits
    })
  } catch (error) {
    console.error('💥 DEBUG endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}