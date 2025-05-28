import { supabase } from './supabase';

/**
 * Test function to verify database connection and table access
 */
export const testDatabaseConnection = async () => {
  try {
    // Test authentication
    console.log('Testing authentication...');
    const authUser = await supabase.auth.getUser();
    console.log('Auth user result:', authUser);
    
    if (!authUser.data.user) {
      console.error('No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }

    // Check if sessions table exists
    console.log('Checking if sessions table exists...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing sessions table:', tableError);
      return { 
        success: false, 
        error: tableError,
        message: 'Sessions table may not exist or you may not have access'
      };
    }
    
    // Try to insert a test session
    console.log('Testing session insertion...');
    const testSession = {
      goal_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
      session_date: new Date().toISOString(),
      duration: 0,
      count: 0,
      notes: 'Test session - will be deleted',
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('sessions')
      .insert([{
        ...testSession,
        user_id: authUser.data.user.id
      }])
      .select();
    
    // If insertion worked, delete the test session
    let deletionResult = null;
    if (insertData && insertData.length > 0) {
      console.log('Test session inserted successfully, cleaning up...');
      const { data: deleteData, error: deleteError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', insertData[0].id)
        .select();
      
      deletionResult = { deleteData, deleteError };
    }
    
    // Test goals table access for comparison
    console.log('Testing goals table access...');
    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .limit(1);
    
    if (goalError) {
      console.error('Error accessing goals table:', goalError);
    }
    
    // Get all sessions for the current user
    console.log('Fetching all sessions for current user...');
    const { data: allSessions, error: allSessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', authUser.data.user.id);
    
    return { 
      success: !tableError && !goalError, 
      tableInfo,
      insertResult: { insertData, insertError },
      deletionResult,
      goals: goalData,
      allSessions,
      allSessionsError,
      user: authUser.data.user
    };
  } catch (error) {
    console.error('Database test error:', error);
    return { success: false, error };
  }
};
