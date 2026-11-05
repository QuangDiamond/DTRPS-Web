import type { AdminProfile } from './common';

export interface AdminAccount {
  profile: AdminProfile;
  password: string;
}

export interface AuthFeature {
  icon: string;
  title: string;
  description: string;
}

/** Nội dung cột thương hiệu bên trái của các màn xác thực */
export interface AuthBrandContent {
  title: string;
  description: string;
  features: AuthFeature[];
}

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}
