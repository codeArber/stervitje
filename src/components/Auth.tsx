// FILE: src/components/Auth/AuthShadcn.tsx

import React, { useState, FormEvent } from 'react';

// Import Shadcn UI components
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Chrome } from "lucide-react"; // Import Chrome icon for Google
import { VideoText } from './magicui/video-text';
import { supabase } from '@/lib/supabase/supabaseClient';

export const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuthAction = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: { data: { username: email.split('@')[0] } } // A better default username
                });
                if (signUpError) throw signUpError;
                setMessage("Sign up successful! Please check your email to verify your account.");
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                if (signInError) throw signInError;
                // Success is handled by the onAuthStateChange listener
            }
        } catch (error: any) {
            console.error(`Auth Error (${isSignUp ? 'Sign Up' : 'Sign In'}):`, error);
            setError(error.error_description || error.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // --- NEW: Handler for Google Sign In ---
    const handleGoogleSignIn = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin, // Redirect back to your app after auth
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // If successful, Supabase handles the redirect, so loading will end on the new page.
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setEmail('');
        setPassword('');
        setError(null);
        setMessage(null);
    };

    return (
        <div className="w-full bg-cover bg-center overflow-x-hidden p-4" style={{ backgroundImage: `url('/background.png')` }}>
            <div className="w-screen h-screen items-center  flex flex-col">
                <div className="relative h-[500px] w-2/3 overflow-hidden">
                    <VideoText src="https://cdn.magicui.design/ocean-small.webm">TRUPI</VideoText>
                </div>
            </div>
            <Card className="w-full max-w-sm mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
                    <CardDescription>
                        {isSignUp ? 'Enter your email below to create your account.' : 'Enter your credentials to access your account.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {message && (
                        <Alert>
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Information</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleAuthAction} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Processing...' : (isSignUp ? 'Create account' : 'Sign in')}
                        </Button>
                    </form>

                    {/* --- NEW: Separator and Google Button --- */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                        <Chrome className="mr-2 h-4 w-4" />
                        Sign {isSignUp ? 'up' : 'in'} with Google
                    </Button>

                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="link" onClick={toggleMode} disabled={loading} >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};