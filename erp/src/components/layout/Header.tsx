"use client";

import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="header">
      <div className="search-bar">
        <input type="text" placeholder="Search patients, doctors, records..." className="search-input" />
      </div>

      <div className="actions">
        <button className="icon-btn" aria-label="Notifications">
          🔔
        </button>
        <div className="user-profile">
          <div className="avatar">
            {session?.user?.name ? session.user.name.charAt(0) : 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{session?.user?.name || 'Guest'}</span>
            <span className="user-role">{session?.user?.role || 'Visitor'}</span>
          </div>
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="logout-btn"
              title="Sign Out"
            >
              🚪
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .header {
          height: var(--header-height);
          background-color: var(--surface-color);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .search-input {
          width: 300px;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
          font-size: 0.9rem;
          background-color: var(--background-color);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          background-color: white;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-left: 16px;
          border-left: 1px solid var(--border-color);
        }

        .avatar {
          width: 36px;
          height: 36px;
          background-color: var(--primary-light);
          color: var(--primary-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .logout-btn {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: 8px;
            padding: 4px;
            border-radius: 50%;
            transition: background 0.2s;
        }
        
        .logout-btn:hover {
            background: #FEE2E2;
        }
      `}</style>
    </header>
  );
}
