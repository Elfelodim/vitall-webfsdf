import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import './dashboard-layout.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="layout-root">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="page-content">
                    <div className="container">
                        {children}
                    </div>
                </main>
            </div>


        </div>
    );
}
