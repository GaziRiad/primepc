// type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
//   type?: "button" | "submit" | "reset";
//   color: "green" | "blue" | "red";
// };

// function convertToArray<T>(value: T): T[] {}

// type ButtonProps<T> = {
//   countValue: T;
//   countHistory: T[];
// };

type ButtonProps = {
  children: React.ReactNode;
  style: React.CSSProperties;
};

export default function Button() {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
      Click me!
    </button>
  );
}
