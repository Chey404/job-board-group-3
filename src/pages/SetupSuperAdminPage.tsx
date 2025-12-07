import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { useNavigate } from 'react-router-dom';

const client = generateClient<Schema>();

const SetupSuperAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const createSuperAdmin = async () => {
    setIsLoading(true);
    setStatus('Creating superadmin account...');

    try {
      // Check if superadmin already exists
      const { data: existingUsers } = await client.models.User.list({
        filter: { email: { eq: 'superadmin@account.com' } }
      });

      if (existingUsers && existingUsers.length > 0) {
        setStatus('Superadmin account already exists!');
        setIsLoading(false);
        return;
      }

      // Create superadmin user
      await client.models.User.create({
        email: 'superadmin@account.com',
        password: 'go-bulldogs-!',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ADMIN',
      });

      setStatus('✅ Superadmin account created successfully!\n\nUsername: superadmin@account.com\nPassword: go-bulldogs-!\n\nYou can now sign in with these credentials.');
    } catch (error: any) {
      console.error('Error creating superadmin:', error);
      setStatus(`❌ Error: ${error.message || 'Failed to create superadmin account'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7f7f7',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          color: '#2d3748',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem'
        }}>
          Setup Superadmin Account
        </h1>

        <p style={{
          color: '#718096',
          marginBottom: '2rem'
        }}>
          This will create a superadmin account with the following credentials:
        </p>

        <div style={{
          backgroundColor: '#f7fafc',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          fontFamily: 'monospace'
        }}>
          <div><strong>Username:</strong> superadmin@account.com</div>
          <div><strong>Password:</strong> go-bulldogs-!</div>
          <div><strong>Role:</strong> ADMIN</div>
        </div>

        <button
          onClick={createSuperAdmin}
          disabled={isLoading}
          style={{
            backgroundColor: '#ba0c2f',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '100%',
            marginBottom: '1rem',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Creating...' : 'Create Superadmin Account'}
        </button>

        {status && (
          <div style={{
            backgroundColor: status.includes('✅') ? '#f0fdf4' : status.includes('❌') ? '#fef2f2' : '#eff6ff',
            color: status.includes('✅') ? '#166534' : status.includes('❌') ? '#991b1b' : '#1e40af',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            whiteSpace: 'pre-line',
            fontSize: '0.875rem'
          }}>
            {status}
          </div>
        )}

        <button
          onClick={() => navigate('/signin')}
          style={{
            backgroundColor: '#e2e8f0',
            color: '#2d3748',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
};

export default SetupSuperAdminPage;
