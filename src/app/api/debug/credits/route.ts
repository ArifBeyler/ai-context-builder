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

    // Handle check action - verify if payment was already processed
    if (action === 'check' && paymentSessionId) {
      console.log(`🔍 Checking if payment session was already processed: ${paymentSessionId}`)
      
      const { data: existingPayment } = await supabaseAdmin
        .from('processed_events')
        .select('id, user_id, credits_added, source, processed_at')
        .eq('stripe_session_id', paymentSessionId)
        .single()

      if (existingPayment) {
        console.log(`✅ Payment already processed by ${existingPayment.source}:`, existingPayment)
        return NextResponse.json({
          alreadyProcessed: true,
          processedBy: existingPayment.source,
          processedAt: existingPayment.processed_at,
          creditsAdded: existingPayment.credits_added
        })
      } else {
        console.log('❌ Payment not yet processed - webhook may have failed')
        return NextResponse.json({
          alreadyProcessed: false,
          message: 'Payment not yet processed by webhook'
        })
      }
    }

    // Handle add action with fallback protection
    if (action === 'add' && paymentSessionId) {
      console.log(`💳 Processing fallback credit addition for session: ${paymentSessionId}`)
      
      // Double-check webhook didn't process this while we were waiting
      const { data: doubleCheck } = await supabaseAdmin
        .from('processed_events')
        .select('id, source')
        .eq('stripe_session_id', paymentSessionId)
        .single()

      if (doubleCheck) {
        console.log(`🚫 BLOCKED: Payment already processed by ${doubleCheck.source} during fallback attempt`)
        return NextResponse.json({
          success: false,
          blocked: true,
          reason: 'already_processed',
          processedBy: doubleCheck.source,
          error: `Payment already processed by ${doubleCheck.source}`
        })
      }

      // Proceed with fallback credit addition
      const { data: userData, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching user:', fetchError)
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      const currentCredits = userData?.credits || 0
      const newCredits = currentCredits + credits

      console.log(`💰 FALLBACK: Updating credits: ${currentCredits} + ${credits} = ${newCredits}`)

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ credits: newCredits })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Error updating credits:', updateError)
        return NextResponse.json({ success: false, error: 'Failed to update credits' }, { status: 500 })
      }

      // Record this fallback payment
      await supabaseAdmin
        .from('processed_events')
        .insert({
          stripe_session_id: paymentSessionId,
          user_id: userId,
          credits_added: credits,
          processed_at: new Date().toISOString(),
          source: source || 'frontend_fallback'
        })

      console.log(`✅ FALLBACK: Successfully added ${credits} credits. User ${userId} now has ${newCredits} credits`)
      
      return NextResponse.json({
        success: true,
        message: `Successfully added ${credits} credits via fallback`,
        newTotal: newCredits,
        creditsAdded: credits,
        fallback: true
      })
    }

    // RATE LIMITING for debug actions (prevent infinite loops)
    if (source === 'debug_console' || source === 'test_button') {
      console.log(`⏰ Rate limiting check for source: ${source}`)
      
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString()
      
      const { data: recentDebugActions } = await supabaseAdmin
        .from('processed_events')
        .select('id, processed_at')
        .eq('user_id', userId)
        .eq('source', source)
        .gte('processed_at', thirtySecondsAgo)

      if (recentDebugActions && recentDebugActions.length > 0) {
        console.log(`🚫 BLOCKED: Rate limit - user made ${recentDebugActions.length} debug actions in last 30 seconds`)
        return NextResponse.json(
          { 
            success: false,
            blocked: true,
            reason: 'rate_limit',
            error: `Please wait 30 seconds between ${source} actions`,
            lastAction: recentDebugActions[recentDebugActions.length - 1].processed_at
          },
          { status: 429 }
        )
      }
    }

    // Reset credits action
    if (action === 'reset') {
      console.log(`🔄 Resetting credits for user ${userId}`)
      
      const { error: resetError } = await supabaseAdmin
        .from('users')
        .update({ credits: 0 })
        .eq('id', userId)

      if (resetError) {
        console.error('❌ Error resetting credits:', resetError)
        return NextResponse.json({ success: false, error: 'Failed to reset credits' }, { status: 500 })
      }

      console.log(`✅ Credits reset to 0 for user ${userId}`)
      return NextResponse.json({ success: true, message: 'Credits reset to 0', newTotal: 0 })
    }

    // Normal credit addition (for debug/test purposes)
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const currentCredits = userData?.credits || 0
    const newCredits = currentCredits + credits

    console.log(`💰 Adding credits: ${currentCredits} + ${credits} = ${newCredits}`)

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating credits:', updateError)
      return NextResponse.json({ success: false, error: 'Failed to update credits' }, { status: 500 })
    }

    // Record this debug action
    if (source && (source === 'debug_console' || source === 'test_button')) {
      await supabaseAdmin
        .from('processed_events')
        .insert({
          stripe_session_id: `debug_${Date.now()}`,
          user_id: userId,
          credits_added: credits,
          processed_at: new Date().toISOString(),
          source: source
        })
    }

    console.log(`✅ Successfully added ${credits} credits. User ${userId} now has ${newCredits} credits`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully added ${credits} credits`,
      newTotal: newCredits,
      creditsAdded: credits
    })

  } catch (error) {
    console.error('💥 Debug credits API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}