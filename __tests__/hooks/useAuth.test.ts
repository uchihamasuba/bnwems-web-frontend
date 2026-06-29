/**
 * @file useAuth.test.ts
 * Unit tests for the useAuth hook via AuthContext.
 */
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuthContext } from '../../src/context/AuthContext';
import { authApiService } from '../../src/services/auth.service';

jest.mock('../../src/services/auth.service', () => ({
  authApiService: { getProfile: jest.fn() },
}));

const mockGetProfile = authApiService.getProfile as jest.Mock;

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
  beforeEach(() => {
    localStorageMock.clear();
    mockGetProfile.mockReset();
  });

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
      userId: 'usr-1', username: 'manager_test', fullName: 'Test Manager',
      role: { roleId: '2', roleName: 'Manager' as const }, status: 'active' as const,
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
      userId: 'usr-2', username: 'test', fullName: 'Test',
      role: { roleId: '1', roleName: 'Admin' as const }, status: 'active' as const,
    };

    act(() => result.current.login('tok', mockUser));
    expect(result.current.isAuthenticated).toBe(true);

    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorageMock.getItem('bnwems_token')).toBeNull();
  });

  it('should keep session when a stored token is re-validated successfully via getProfile()', async () => {
    localStorageMock.setItem('bnwems_token', 'old.token');
    localStorageMock.setItem(
      'bnwems_user',
      JSON.stringify({ userId: 'usr-1', username: 'manager_test', fullName: 'Test Manager', role: { roleId: '2', roleName: 'Manager' }, status: 'active' })
    );
    mockGetProfile.mockResolvedValue({
      success: true,
      data: { userId: 'usr-1', username: 'manager_test', fullName: 'Test Manager', role: { roleId: '2', roleName: 'Manager' }, status: 'active' },
    });

    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    expect(mockGetProfile).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('manager_test');
  });

  it('should clear a stale token from a previous backend when getProfile() rejects', async () => {
    localStorageMock.setItem('bnwems_token', 'stale.token.from.old.backend');
    localStorageMock.setItem(
      'bnwems_user',
      JSON.stringify({ userId: 'usr-1', username: 'manager_test', fullName: 'Test Manager', role: { roleId: '2', roleName: 'Manager' }, status: 'active' })
    );
    mockGetProfile.mockRejectedValue(new Error('Request failed with status code 401'));

    const { result } = renderHook(() => useAuthContext(), { wrapper });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorageMock.getItem('bnwems_token')).toBeNull();
    expect(localStorageMock.getItem('bnwems_user')).toBeNull();
  });
});
