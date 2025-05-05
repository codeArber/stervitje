// src/components/Auth/AuthShadcn.tsx

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
import { Terminal } from "lucide-react"; // Example icon for Alert
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuthStore } from '@/hooks/useAuthStore';
import { VideoText } from './magicui/video-text';

export const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false); // Start in Sign In mode
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);


    const handleAuthAction = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            let response;
            if (isSignUp) {
                // --- Sign Up ---
                response = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            username: email
                        }
                    }
                });
                const { data, error: signUpError } = response;
                if (signUpError) throw signUpError;

                if (data.user && data.user.identities?.length === 0) {
                    setMessage("Sign up successful! Check email for confirmation (verification needed).");
                } else if (data.session) {
                    setMessage("Sign up successful! Logged in.");
                } else {
                    setMessage("Sign up successful! Please check email to verify account.");
                }
                // Consider not clearing form on sign up success until confirmation if needed
                // setEmail('');
                // setPassword('');
            } else {
                // --- Sign In ---
                response = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                const { error: signInError } = response;
                if (signInError) throw signInError;
                setMessage("Sign in successful!");

                // Login success normally triggers onAuthStateChange listener
            }
        } catch (error: any) {
            console.error(`Auth Error (${isSignUp ? 'Sign Up' : 'Sign In'}):`, error);
            setError(error.error_description || error.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setEmail('');
        setPassword('');
        setError(null);
        setMessage(null);
    };

    return (
        // insert img background.png as background
        <div className="w-full bg-fill bg-center overflow-x-hidden p-4" style={{ backgroundImage: `url('/background.png')` }}>
            <div className="w-screen h-screen items-center  flex flex-col">
                <div className="relative h-[500px] w-2/3 overflow-hidden">
                    <VideoText src="https://cdn.magicui.design/ocean-small.webm">TRUPI</VideoText>
                </div>
            </div>
            <Card className="w-full max-w-sm mx-auto"> {/* Control width here */}
                <CardHeader>
                    <CardTitle className="text-2xl">{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
                    <CardDescription>
                        {isSignUp ? 'Enter your email below to create your account.' : 'Enter your credentials to access your account.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <Terminal className="h-4 w-4" /> {/* Example Icon */}
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}
                    {message && (
                        <Alert variant="default"> {/* Or another less intrusive variant */}
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Information</AlertTitle>
                            <AlertDescription>
                                {message}
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleAuthAction} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            {/* Add Forgot Password link here if needed */}
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Processing...' : (isSignUp ? 'Create account' : 'Sign in')}
                        </Button>
                        {/* Optional: Add OAuth buttons here */}
                        {/* <Button variant="outline" className="w-full">Login with Google</Button> */}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center"> {/* Center the toggle button */}
                    <Button variant="link" onClick={toggleMode} disabled={loading} >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};