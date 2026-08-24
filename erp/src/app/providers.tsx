'use client';

import { SessionProvider } from 'next-auth/react';

// Mock session for development bypass
const mockSession = {
    user: {
        name: 'Admin User',
        email: 'admin@antineo.com',
        image: null,
        role: 'Admin',
        id: 'admin-id-123'
    },
    expires: '2099-01-01T00:00:00.000Z'
};

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider session={mockSession}>
            {children}
        </SessionProvider>
    );
}
