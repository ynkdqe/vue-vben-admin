interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;

type TabOption = BasicOption;

interface BasicUserInfo {
  avatar: string;
  surname?: string;
  name: string;
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: string;
  birthday: string;
  address: string;
  isActive: boolean;
  extraProperties: any;
}

type ClassType = Array<object | string> | object | string;

export type { BasicOption, BasicUserInfo, ClassType, SelectOption, TabOption };
