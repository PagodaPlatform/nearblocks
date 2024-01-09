import { create } from 'zustand';

type VmState = {
  cache: any;
  CommitButton: any;
  EthersProvider: any;
  Widget: any;
  near: any;
};

type VmStore = VmState & {
  set: (update: VmState) => void;
};

export const useVmStore = create<VmStore>((set) => ({
  cache: null,
  CommitButton: null,
  EthersProvider: null,
  Widget: null,
  near: null,
  set: (params) => set(() => ({ ...params })),
}));
