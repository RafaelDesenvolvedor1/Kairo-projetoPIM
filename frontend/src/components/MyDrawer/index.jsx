import { Drawer } from "antd";

export default function MyDrawer({ title, children, open, onClose, ...props }) {
  return (
    <Drawer title={title} open={open} onClose={onClose} {...props}>
      {children}
    </Drawer>
  );
}