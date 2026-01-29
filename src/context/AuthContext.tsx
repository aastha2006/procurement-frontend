import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, AuthUser } from '../api';
import { toast } from 'sonner';

interface AuthContextType {
    user: AuthUser | null;
    login: (user: AuthUser) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Initial Load from LocalStorage
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Basic expiry check could go here, but api.ts handles refresh
                setUser(parsedUser);
            } catch (error) {
                console.error('AuthContext: Failed to parse user', error);
                localStorage.removeItem('authUser');
            }
        }
        setIsLoading(false);

        // 2. Subscribe to API Token Changes (e.g. Refresh)
        const unsubscribeApi = api.subscribeToTokenChanges((updatedUser) => {
            console.log('AuthContext: Received token update from API');
            setUser(updatedUser);
            if (!updatedUser) {
                // If updatedUser is null, it means logout happened in api.ts
                toast.error('Session expired', { description: 'Please login again.' });
            }
        });

        // 3. Sync across Tabs
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'authUser') {
                console.log('AuthContext: Synced from another tab');
                if (event.newValue) {
                    try {
                        const newUser = JSON.parse(event.newValue);
                        setUser(newUser);
                    } catch (e) {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                    toast.info('Logged out from another tab');
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            unsubscribeApi();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const login = (userData: AuthUser) => {
        setUser(userData);
        localStorage.setItem('authUser', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authUser');
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
