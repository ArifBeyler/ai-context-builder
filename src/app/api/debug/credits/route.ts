import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, credits } = await request.json()

    if (!userId || !credits) {
      return NextResponse.json(
        { error: 'userId and credits are required' },
        { status: 400 }
      )
    }

    console.log(`🔧 DEBUG: Manually updating credits for user ${userId}`)

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
            credits: credits,
          })

        if (createError) {
          console.error('❌ Error creating user:', createError)
          return NextResponse.json(
            { error: 'Failed to create user: ' + createError.message },
            { status: 500 }
          )
        }

        console.log(`✅ DEBUG: Created new user ${userId} with ${credits} credits`)
        return NextResponse.json({ 
          success: true, 
          message: `Created user and added ${credits} credits`,
          newTotal: credits
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
    const newCredits = currentCredits + credits
    
    console.log(`💰 DEBUG: Updating credits: ${currentCredits} + ${credits} = ${newCredits}`)
    
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

    console.log(`✅ DEBUG: Successfully added ${credits} credits to user ${userId}. New total: ${newCredits}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Added ${credits} credits`,
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