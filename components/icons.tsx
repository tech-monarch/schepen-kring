import * as React from "react";
import { LucideProps } from "lucide-react";

// You can add more icons here as needed
export const Icons = {
  // Add your icon components here
  // Example:
  // home: (props: LucideProps) => (
  //   <svg
  //     xmlns="http://www.w3.org/2000/svg"
  //     width="24"
  //     height="24"
  //     viewBox="0 0 24 24"
  //     fill="none"
  //     stroke="currentColor"
  //     strokeWidth="2"
  //     strokeLinecap="round"
  //     strokeLinejoin="round"
  //     {...props}
  //   >
  //     <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  //     <polyline points="9 22 9 12 15 12 15 22" />
  //   </svg>
  // ),
  // Add more icons as needed
} as const;

export type IconName = keyof typeof Icons;
