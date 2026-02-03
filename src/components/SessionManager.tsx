
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { jwtDecode } from 'jwt-decode'; // Fixed import syntax
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';

interface DecodedToken {
    exp: number;
    sub: string;
}

export function SessionManager() {
    const { user, logout } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!user || !user.accessToken) {
            setShowWarning(false);
            return;
        }

        try {
            const decoded: DecodedToken = jwtDecode(user.accessToken);
            const expiryTime = decoded.exp * 1000; // Convert to ms

            const checkExpiry = () => {
                const now = Date.now();
                const timeRemaining = expiryTime - now;

                // Update debug/display state
                setTimeLeft(timeRemaining);

                if (timeRemaining <= 0) {
                    // Expired
                    console.log('Session expired, logging out');
                    // Only logout if we haven't already noticed it's expired
                    if (showWarning) setShowWarning(false);
                    logout();
                    return;
                }

                // Show warning if less than 2 minutes (120000 ms) remain
                // And we are not already showing it
                if (timeRemaining < 120000 && !showWarning) {
                    console.log('Session warning triggered. Time remaining:', timeRemaining);
                    setShowWarning(true);
                }

                // Hide warning if renewed (time > 2 mins)
                if (timeRemaining > 120000 && showWarning) {
                    setShowWarning(false);
                }
            };

            // Check immediately
            checkExpiry();

            // Check every 5 seconds (more frequent for better responsiveness)
            const intervalId = setInterval(checkExpiry, 5000);

            return () => clearInterval(intervalId);

        } catch (error) {
            console.error('Invalid token format', error);
        }
    }, [user, user?.accessToken, logout, showWarning]); // Re-run when token changes

    const handleContinueSession = async () => {
        try {
            const success = await api.refreshToken();
            if (success) {
                toast.success('Session extended successfully');
                setShowWarning(false);
            } else {
                toast.error('Failed to extend session');
                logout();
            }
        } catch (error) {
            console.error("Refresh failed", error);
            logout();
        }
    };

    const handleLogout = () => {
        setShowWarning(false);
        logout();
    };

    // If no user, don't render anything (or if warning false)
    // However, we want to render the dialog if showWarning is true

    if (!user) return null;

    return (
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your session will expire in less than 2 minutes.
                        Do you want to continue working?
                        <br />
                        <span className="text-xs text-muted-foreground mt-2 block">
                            (Time remaining: ~{Math.floor(timeLeft / 1000)} seconds)
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleLogout}>Log out</AlertDialogCancel>
                    <AlertDialogAction onClick={handleContinueSession}>Continue Session</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
