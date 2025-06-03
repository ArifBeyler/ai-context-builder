import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get the correct base URL - use the current request's host
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('host') || 'localhost:3003'
    // Force use the correct host, ignore environment variable for development
    const baseUrl = `${protocol}://${host}`
    
    console.log('🔗 Using base URL for Stripe redirect:', baseUrl)
    console.log('📋 Request headers - host:', host, 'protocol:', protocol)
    console.log('🚫 Ignoring NEXT_PUBLIC_APP_URL to use current host')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '5 Credits Package',
              description: '5 credits for AI Context Builder',
            },
            unit_amount: 100, // 1 USD in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        userId: userId,
        credits: '5',
      },
    })

    console.log('✅ Stripe session created:', session.id)
    console.log('🔗 Success URL will be:', `${baseUrl}/?success=true&session_id=${session.id}`)

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    
    // Check if it's a Stripe authentication error
    if (error?.type === 'StripeAuthenticationError') {
      console.log('🚨 Stripe API key issue detected - suggesting test payment')
      return NextResponse.json(
        { 
          error: 'Payment system configuration issue',
          useTestPayment: true,
          message: 'Stripe is not configured properly. Use test payment instead.'
        },
        { status: 400 }
      )
    }
    
    // For other errors, provide helpful feedback
    return NextResponse.json(
      { 
        error: 'Payment system error',
        message: error?.message || 'Unable to create payment session',
        useTestPayment: true
      },
      { status: 500 }
    )
  }
} 