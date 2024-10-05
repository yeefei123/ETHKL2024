import { headers } from "next/headers";
import { ReactNode } from "react";
import { cookieToInitialState } from "wagmi";
import ClientLayout from "./ClientLayout";
import { config } from "./config";

type LayoutProps = {
  children: ReactNode;
};

const Layout = async ({ children }: LayoutProps) => {
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <html lang="en">
      <head>
        <title>FunFund Crowdfunding</title>
      </head>
      <body
        className="min-h-screen flex flex-col bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: `url('/img/background.jpg')`,
          backgroundSize: "cover",
        }}
      >
        {/* Render client-side layout and pass initialState as prop */}
        <ClientLayout initialState={initialState}>{children}</ClientLayout>
      </body>
    </html>
  );
};

export default Layout;
