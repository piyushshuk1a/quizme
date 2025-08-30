import { SIGNUP_ROLE_ACTIONS, USER_ROLES } from '@/constants';
import { createStore } from '@/utils';

export type UserRoles = ObjectValuesUnion<typeof USER_ROLES>;

type UseSignupStore = {
  role: UserRoles | '';

  /**
   * Handles setting the state for the signup role
   * The role that was selected by the user during sign up
   * @param state The newly selected tenant
   */
  updateRole: (role: UserRoles) => void;
};

export const useSignupRole = createStore<UseSignupStore>((set) => ({
  role: '',
  updateRole: (role) =>
    set({ role }, false, {
      payload: { role },
      type: SIGNUP_ROLE_ACTIONS.update,
    }),
}));
