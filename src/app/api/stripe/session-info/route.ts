import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Retrieving Stripe session:', sessionId)

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    console.log('📋 Stripe session retrieved:', {
      id: session.id,
      payment_status: session.payment_status,
      metadata: session.metadata
    })

    // Check if we have user ID in metadata
    const userId = session.metadata?.userId || session.client_reference_id

    if (userId) {
      console.log('✅ Found user ID in Stripe session:', userId)
      return NextResponse.json({
        success: true,
        userId: userId,
        paymentStatus: session.payment_status,
        sessionId: session.id
      })
    } else {
      console.log('❌ No user ID found in Stripe session metadata')
      return NextResponse.json({
        success: false,
        error: 'No user ID found in session',
        paymentStatus: session.payment_status,
        sessionId: session.id
      })
    }

  } catch (error) {
    console.error('❌ Error retrieving Stripe session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session info' },
      { status: 500 }
    )
  }
} 