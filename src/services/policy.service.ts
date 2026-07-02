import api from './api';

export interface GetPoliciesQuery {
  policyType?: string;
  isActive?: boolean;
}

export const policyApiService = {
  /** GET /api/v1/policies (UC 2.6) */
  async getPolicies(params?: GetPoliciesQuery) {
    const response = await api.get('/policies', { params });
    return response.data;
  },
};
