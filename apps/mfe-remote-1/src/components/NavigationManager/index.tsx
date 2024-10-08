import { ReactElement, useEffect } from "react";
import {
  matchRoutes,
  useLocation,
  useNavigate,
  useNavigationType,
  NavigationType,
} from "react-router-dom";
import { NavigationEvent } from "@cnapp-ui/mfe-utils";
import { useRoutes } from "../../routing/routes";

interface NavigationManagerProps {
  children: ReactElement;
  shellRoutingPrefix?: string;
  appRoutingPrefix?: string;
}

export function NavigationManager({
  children,
  shellRoutingPrefix,
  appRoutingPrefix,
}: NavigationManagerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const routes = useRoutes(shellRoutingPrefix, appRoutingPrefix);

  useEffect(() => {
    function shellNavigationHandler(event: Event) {
      const { pathname, search } = (event as NavigationEvent).detail;
      if (
        (location.pathname === pathname && location.search === search) ||
        !matchRoutes(routes, { pathname })
      ) {
        return;
      }
      navigate(`${pathname}${search}`, {
        replace: navigationType === NavigationType.Replace,
      });
    }

    window.addEventListener(
      `[${shellRoutingPrefix}] navigated`,
      shellNavigationHandler,
    );

    return () => {
      window.removeEventListener(
        `[${shellRoutingPrefix}] navigated`,
        shellNavigationHandler,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    window.dispatchEvent(
      new NavigationEvent(`[${appRoutingPrefix}] navigated`, {
        detail: {
          pathname: location.pathname,
          search: location.search,
          navigationType,
        },
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return children;
}
