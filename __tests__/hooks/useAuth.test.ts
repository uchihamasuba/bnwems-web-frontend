/**
 * @file useAuth.test.ts
 * Unit tests for the useAuth hook via AuthContext.
 */
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuthContext } from '../../src/context/AuthContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthContext — useAuthContext()', () => {
  beforeEach(() => localStorageMock.clear());

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(AuthProvider, null, children);

  it('should start with unauthenticated state', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });
    // Wait for the useEffect to run
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should set user and token on login()', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const mockUser = {
      id: 1, username: 'manager_test', full_name: 'Test Manager',
      role: 'Manager', platform_access: 'web',
    };

    act(() => {
      result.current.login('mock.token', mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('manager_test');
    expect(result.current.token).toBe('mock.token');
    expect(localStorageMock.getItem('bnwems_token')).toBe('mock.token');
  });

  it('should clear state on logout()', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    const mockUser = {
      id: 1, username: 'test', full_name: 'Test',
      role: 'Admin', platform_access: 'web',
    };

    act(() => result.current.login('tok', mockUser));
    expect(result.current.isAuthenticated).toBe(true);

    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorageMock.getItem('bnwems_token')).toBeNull();
  });
});
