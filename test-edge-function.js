// Simple script to test the Edge Function directly
const testEdgeFunction = async () => {
  try {
    // Get the current user and session
    const { createClient } = require('@supabase/supabase-js');
    
    // Replace with your actual values
    const supabaseUrl = 'https://htbbefrljppseywpdwao.supabase.co';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Sign in to get a valid session
    const email = process.env.TEST_EMAIL || '';
    const password = process.env.TEST_PASSWORD || '';
    
    console.log('Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    }
    
    console.log('Successfully signed in');
    
    // Get the access token
    const accessToken = signInData.session.access_token;
    const userId = signInData.user.id;
    
    console.log('User ID:', userId);
    console.log('Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
    
    // Call the Edge Function
    console.log('Calling Edge Function...');
    const response = await fetch(
      `${supabaseUrl}/functions/v1/delete-user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          password,
          userId
        })
      }
    );
    
    console.log('Response status:', response.status);
    
    const result = await response.json();
    console.log('Response body:', result);
    
  } catch (error) {
    console.error('Error testing Edge Function:', error);
  }
};

// Run the test
testEdgeFunction();
