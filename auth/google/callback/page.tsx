import React, { Suspense } from "react";
import GoogleCallbackClient from "./GoogleCallbackClient";

export default function GoogleCallback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleCallbackClient />
    </Suspense>
  );
}