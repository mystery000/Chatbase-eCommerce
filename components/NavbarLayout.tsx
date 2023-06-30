import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';

import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import Link from 'next/link';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function NavbarLayout({ children }: LayoutProps) {
  return (
    <div className="mx-auto flex flex-col space-y-4">
      <div className="flex items-center justify-between p-4">
        <div className="flex lg:flex-1"></div>
        <div className="hidden lg:flex lg:gap-x-12">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    API
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Guide
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/chatbots" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    My Chatbots
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a
            className="text-sm font-semibold leading-6 text-gray-900"
            href="/account"
          >
            <img
              className="m-1 rounded-full border-2"
              alt="profile picture"
              width={36}
              height={36}
              src="https://backend.chatbase.co/storage/v1/object/public/chatbots-profile-pictures/41291895-cdbe-487c-b1a3-fb65ce5ebde6/2WRGxVZYEi6cE-K1XcIQj.jfif?width=48&quality=100 1x, https://backend.chatbase.co/storage/v1/object/public/chatbots-profile-pictures/41291895-cdbe-487c-b1a3-fb65ce5ebde6/2WRGxVZYEi6cE-K1XcIQj.jfif?width=96&quality=100 2x"
            />
          </a>
        </div>
      </div>
      <div>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
