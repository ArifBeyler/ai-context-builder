import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received')
  
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.log('❌ No signature found in webhook')
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
      console.log('✅ Webhook signature verified, event type:', event.type)
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    if (event.type === 'checkout.session.completed') {
      console.log('💳 Processing checkout.session.completed event')
      
      const session = event.data.object as any
      const userId = session.metadata?.userId
      const credits = parseInt(session.metadata?.credits || '0')

      console.log('📋 Session metadata:', { userId, credits })

      if (userId && credits > 0) {
        console.log('🔍 Looking up user in database:', userId)
        
        // Get current user credits
        const { data: userData, error: fetchError } = await supabase
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

        console.log('👤 Current user data:', userData)

        // Update user credits
        const currentCredits = userData?.credits || 0
        const newCredits = currentCredits + credits
        
        console.log(`💰 Updating credits: ${currentCredits} + ${credits} = ${newCredits}`)
        
        const { error: updateError } = await supabase
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

        console.log(`✅ Successfully added ${credits} credits to user ${userId}. New total: ${newCredits}`)
      } else {
        console.log('⚠️ Invalid userId or credits in session metadata')
      }
    } else {
      console.log('ℹ️ Ignoring event type:', event.type)
    }

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('💥 Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 