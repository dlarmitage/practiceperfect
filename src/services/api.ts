import type { Goal, Session, User } from '../types';
import type { SortMethod } from '../context/GoalContext';

// Helper to handle API responses
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');

    const res = await fetch(`/api${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API call failed: ${res.statusText}`);
    }

    return res.json();
}

// --- Auth Services ---

export const signUp = async (email: string, password: string, firstName: string) => {
    const response = await fetchApi<{ user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName }),
    });
    return { data: { user: response.user }, error: null };
};

export const signIn = async (email: string, password: string) => {
    const response = await fetchApi<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    return { data: { user: response.user }, error: null };
};

export const signOut = async () => {
    await fetchApi('/auth/logout', { method: 'POST' });
    return true;
};

export const getCurrentUser = async () => {
    try {
        const response = await fetchApi<{ user: User | null }>('/auth/me');
        return { data: { user: response.user }, error: null };
    } catch (e) {
        return { data: { user: null }, error: e };
    }
};

// --- Goal Services ---

// Map API Goal (camelCase from Drizzle) to Frontend Goal (legacy mix)
const mapGoal = (apiGoal: any): Goal => ({
    ...apiGoal,
    user_id: apiGoal.userId,
    // Ensure dates are strings if they aren't already
    startDate: apiGoal.startDate ? new Date(apiGoal.startDate).toISOString() : apiGoal.startDate,
    dueDate: apiGoal.dueDate ? new Date(apiGoal.dueDate).toISOString() : apiGoal.dueDate,
    createdAt: apiGoal.createdAt ? new Date(apiGoal.createdAt).toISOString() : apiGoal.createdAt,
    updatedAt: apiGoal.updatedAt ? new Date(apiGoal.updatedAt).toISOString() : apiGoal.updatedAt,
});

export const getGoals = async (sortMethod: SortMethod = 'newest'): Promise<Goal[]> => {
    const goals = await fetchApi<any[]>('/goals');
    const mappedGoals = goals.map(mapGoal);

    // Client-side sorting since API returns simple list
    if (sortMethod === 'newest') {
        return mappedGoals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortMethod === 'oldest') {
        return mappedGoals.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortMethod === 'custom') {
        return mappedGoals.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    return mappedGoals;
};

export const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => {
    const apiGoal = await fetchApi<any>('/goals', {
        method: 'POST',
        body: JSON.stringify(goal),
    });
    return mapGoal(apiGoal);
};

export const updateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const apiGoal = await fetchApi<any>(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return mapGoal(apiGoal);
};

export const deleteGoal = async (id: string): Promise<boolean> => {
    await fetchApi(`/goals/${id}`, { method: 'DELETE' });
    return true;
};

// --- Session Services ---

const mapSession = (apiSession: any): Session => ({
    ...apiSession,
    user_id: apiSession.userId,
    goal_id: apiSession.goalId,
    session_date: apiSession.sessionDate, // API sends ISO string
    created_at: apiSession.createdAt,
});

export const getSessions = async (): Promise<Session[]> => {
    const sessions = await fetchApi<any[]>('/sessions');
    return sessions.map(mapSession);
};

export const getSessionsByGoal = async (goalId: string): Promise<Session[]> => {
    const sessions = await fetchApi<any[]>(`/sessions?goalId=${goalId}`);
    return sessions.map(mapSession);
};

export const createSession = async (session: Omit<Session, 'id' | 'created_at' | 'user_id'>) => {
    // Map frontend snake_case to API camelCase expectation
    const payload = {
        ...session,
        goalId: session.goal_id,
        sessionDate: session.session_date,
    };

    const apiSession = await fetchApi<any>('/sessions', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapSession(apiSession);
};

export const updateSession = async (id: string, updates: Partial<Session>): Promise<Session> => {
    const apiSession = await fetchApi<any>(`/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    return mapSession(apiSession);
};

export const deleteSession = async (id: string) => {
    await fetchApi(`/sessions/${id}`, { method: 'DELETE' });
    return true;
};

// --- Helpers matching legacy interface ---

export const incrementGoalCount = async (id: string): Promise<Goal> => {
    // We first fetch the goal to get current count, or rely on the backend to atomic increment.
    // For simplicity here, we assume the frontend context drives the logic or we implement a specific increment endpoint.
    // Ideally: POST /goals/[id]/increment. 
    // But let's reuse updateGoal for now, fetching first if needed, but context usually optimistically updates.
    // Wait, context calls this. If we just expose 'updateGoal', we can use it.
    // But to keep interface:
    // Fetch first to get current count? Or rely on optimistic context?
    // The context calls this expecting a return.
    // Let's implement a quick atomic increment endpoint logic? 
    // No, let's keep it simple: Frontend context knows the new count usually? 
    // Actually, GoalContext.tsx optimistic update logic: 
    //   const optimisticGoal = { ... count: current + 1 }
    //   setGoals(...)
    //   await incrementGoalService(id);
    // It expects the service to handle it.

    // Implementation: generic update is strictly defined.
    // We'll trust the generic updateGoal for specific field updates in this migration.
    // However, without knowing the current count server-side, we risk race conditions.
    // BUT, to satisfy the *interface*, we need this function.
    // I'll assume we can use a server-side increment or just fetch-update.

    // Let's implement fetch-update for correctness in this mvp migration
    const currentGoals = await getGoals();
    const goal = currentGoals.find(g => g.id === id);
    if (!goal) throw new Error('Goal not found');

    return updateGoal(id, { count: goal.count + 1 });
};

export const updateGoalSortOrder = async (id: string, sortOrder: number): Promise<Goal> => {
    return updateGoal(id, { sortOrder });
};

// --- Profile & Auth Helpers ---

export const updateProfile = async (updates: { firstName: string }) => {
    const response = await fetchApi<{ user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ displayName: updates.firstName }),
    });
    return response.user;
};

export const updateEmail = async ({ email: _email }: { email: string }) => {
    throw new Error('Email update is not available in this version.');
};

export const updatePassword = async ({ currentPassword: _currentPassword, newPassword: _newPassword }: any) => {
    throw new Error('Password update is not available in this version.');
};

export const resetPassword = async (_email: string) => {
    throw new Error('Password reset is not available. Please contact support.');
};
