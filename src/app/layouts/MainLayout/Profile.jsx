// Import Dependencies
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
  Portal,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

import { Link } from "react-router";
import { useState, useEffect } from "react";
import axios from "utils/axios";

// Local Imports
import { Avatar, AvatarDot, Button } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { ChangePasswordModal } from "components/modals/ChangePasswordModal";

// ----------------------------------------------------------------------


export function Profile() {
  const { logout } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const fullName = profile
    ? [profile.prefix, profile.firstname, profile.lastname]
      .filter(Boolean)
      .join(" ")
    : "Guest";

  const designation = profile?.designation || "";

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login?redirect=";
  };

  return (
    <>
      <Popover className="relative">
        <PopoverButton
          as={Avatar}
          size={12}
          role="button"
          name={fullName}
          initialColor="neutral"
          alt={fullName}
          indicator={
            <AvatarDot color="success" classNam e="ltr:right-0 rtl:left-0" />
          }
          classNames={{
            root: "cursor-pointer",
          }}
        />
        <Portal>
          <Transition
            enter="duration-200 ease-out"
            enterFrom="translate-x-2 opacity-0"
            enterTo="translate-x-0 opacity-100"
            leave="duration-200 ease-out"
            leaveFrom="translate-x-0 opacity-100"
            leaveTo="translate-x-2 opacity-0"
          >
            <PopoverPanel
              anchor={{ to: "right end", gap: 12 }}
              className="border-gray-150 shadow-soft dark:border-dark-600 dark:bg-dark-700 z-[9999] flex w-64 flex-col rounded-lg border bg-white transition dark:shadow-none"
            >
              {({ close }) => (
                <>
                  <div className="dark:bg-dark-800 flex items-center gap-4 rounded-t-lg bg-gray-100 px-4 py-5">
                    <Avatar
                      size={14}
                      name={fullName}
                      initialColor="neutral"
                      alt={fullName}
                    />
                    <div>
                      <Link
                        className="hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400 text-base font-medium text-gray-700"
                        to="/settings/general"
                      >
                        {fullName}
                      </Link>

                      <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-400">
                        {designation}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col pt-2 pb-5">
                    <div className="px-4 py-2">
                      <Button
                        className="w-full gap-2 justify-start"
                        variant="flat"
                        color="secondary"
                        onClick={() => {
                          setIsPasswordModalOpen(true);
                          close(); // Close the dropdown when opening modal
                        }}
                      >
                        <KeyIcon className="size-4.5" />
                        <span>Change Password</span>
                      </Button>
                    </div>
                    <div className="px-4 border-t border-gray-100 dark:border-dark-600 pt-2">
                      <Button className="w-full gap-2" onClick={handleLogout}>
                        <ArrowLeftStartOnRectangleIcon className="size-4.5" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </PopoverPanel>
          </Transition>
        </Portal>
      </Popover>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}
