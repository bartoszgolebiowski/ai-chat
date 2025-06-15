export type RawTreeNode = {
  name: string;
  children: RawTreeNode[];
  tags: string;
};

export type InternalTreeNode = {
  name: string;
  children: InternalTreeNode[];
  tags: string;
  id: string;
  isChecked: boolean;
  isIndeterminate: boolean;
  isExpanded: boolean;
};
