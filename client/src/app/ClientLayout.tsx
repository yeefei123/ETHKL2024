"use client";

import type { ISuccessResult } from "@worldcoin/idkit";
import { IDKitWidget, useIDKit, VerificationLevel } from "@worldcoin/idkit";
import { ReactNode, useEffect, useState } from "react";
import { verify } from "./action/verify";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Web3ModalProvider from "./context";
import { FormProvider } from "./context/FormContext";
import "./styles/globals.css";

type ClientLayoutProps = {
  children: ReactNode;
  initialState: any;
};

// Utility function to truncate userId
const truncateUserId = (userId: string, startLength = 6, endLength = 4) => {
  return `${userId.slice(0, startLength)}...${userId.slice(-endLength)}`;
};

const ClientLayout = ({ children, initialState }: ClientLayoutProps) => {
  const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`;
  const action = process.env.NEXT_PUBLIC_WLD_ACTION;

  if (!app_id) {
    throw new Error("app_id is not set in environment variables!");
  }
  if (!action) {
    throw new Error("action is not set in environment variables!");
  }

  const { setOpen } = useIDKit();
  const [userId, setUserId] = useState<string | null>(null);

  // Check for user ID in localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Handle success from World ID verification
  const onSuccess = (result: ISuccessResult) => {
    window.alert(
      "Successfully verified with World ID! Your nullifier hash is: " +
        result.nullifier_hash
    );
  };

  // Handle proof verification with backend
  const handleProof = async (result: ISuccessResult) => {
    console.log(
      "Proof received from IDKit, sending to backend:\n",
      JSON.stringify(result)
    );
    const data = await verify(result);
    if (data.success) {
      console.log("Successful response from backend:\n", JSON.stringify(data));
      localStorage.setItem("userId", result.nullifier_hash);
      localStorage.setItem("proof", JSON.stringify(result.proof));
      setUserId(result.nullifier_hash); // Update state to display userId
    } else {
      throw new Error(`Verification failed: ${data.detail}`);
    }
  };

  // Log out function to clear localStorage and reset state
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("proof");
    setUserId(null);
  };

  return (
    <Web3ModalProvider initialState={initialState}>
      <div className="flex-1 flex flex-row">
        <div className="sm:flex hidden mr-10 ml-10 relative">
          <Sidebar />
        </div>

        <div className="absolute top-4 right-4 flex-row">
          {userId ? (
            <div>
              <p className="mb-2">Logged in as: {truncateUserId(userId)}</p>
              <button
                className="border border-red-500 rounded-md text-red-500 py-1 px-3"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              {/* World ID Verification Widget */}
              <IDKitWidget
                action={action}
                app_id={app_id}
                onSuccess={onSuccess}
                handleVerify={handleProof}
                verification_level={VerificationLevel.Orb}
              />
              <button
                className="border border-black rounded-md"
                onClick={() => setOpen(true)}
              >
                <div className="mx-3 my-1">Verify with World ID</div>
              </button>
            </>
          )}
          <w3m-button />
        </div>

        {/* Main content area */}
        <div className="flex-1 max-sm:w-full max-w-[1280px] mx-auto sm:pr-5">
          <FormProvider>
            <main className="flex-1 pt-5 p-4">{children}</main>
          </FormProvider>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </Web3ModalProvider>
  );
};

export default ClientLayout;
