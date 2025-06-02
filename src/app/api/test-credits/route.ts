import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test Credits Endpoint Called')
    
    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'test-user-' + Date.now()
    const credits = parseInt(searchParams.get('credits') || '5')

    console.log(`🔧 Testing credit addition for user: ${userId}, credits: ${credits}`)

    // First check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create it
      console.log('👤 Creating new test user...')
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          anonymous_id: userId,
          credits: credits,
        })

      if (createError) {
        console.error('❌ Error creating user:', createError)
        return NextResponse.json({
          error: 'Failed to create user: ' + createError.message,
          details: createError
        }, { status: 500 })
      }

      console.log(`✅ Created new user ${userId} with ${credits} credits`)
      return NextResponse.json({
        success: true,
        message: `Created user ${userId} with ${credits} credits`,
        userId,
        totalCredits: credits,
        userExists: false
      })
    }

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError)
      return NextResponse.json({
        error: 'User fetch error: ' + fetchError.message,
        details: fetchError
      }, { status: 500 })
    }

    // User exists, update credits
    const currentCredits = existingUser?.credits || 0
    const newCredits = currentCredits + credits

    console.log(`💰 Updating credits: ${currentCredits} + ${credits} = ${newCredits}`)

    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating credits:', updateError)
      return NextResponse.json({
        error: 'Failed to update credits: ' + updateError.message,
        details: updateError
      }, { status: 500 })
    }

    console.log(`✅ Successfully updated user ${userId}. New total: ${newCredits}`)
    
    return NextResponse.json({
      success: true,
      message: `Added ${credits} credits to user ${userId}`,
      userId,
      previousCredits: currentCredits,
      addedCredits: credits,
      totalCredits: newCredits,
      userExists: true
    })

  } catch (error) {
    console.error('💥 Test endpoint error:', error)
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: error
    }, { status: 500 })
  }
} 