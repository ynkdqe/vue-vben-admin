import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  desc: string;
  homePath: string;
  token: string;
}

export type { UserInfo };
