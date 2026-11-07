import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  pathname: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: window.location.pathname || '/',
  navigate: () => {},
});

export const Router: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => {
    // Standardize pathname (remove trailing slash unless root)
    const path = window.location.pathname;
    if (path.length > 1 && path.endsWith('/')) {
      return path.slice(0, -1);
    }
    return path || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      let path = window.location.pathname;
      if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      setPathname(path || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    let cleanPath = to;
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }
    if (cleanPath !== pathname) {
      window.history.pushState({}, '', cleanPath);
      setPathname(cleanPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useNavigate = () => {
  const context = useContext(RouterContext);
  return context.navigate;
};

export const useLocation = () => {
  const context = useContext(RouterContext);
  return { pathname: context.pathname };
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({ to, children, className = '', onClick, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow standard browser shortcuts (Cmd/Ctrl + click to open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    onClick?.(e);
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export interface RouteProps {
  path: string;
  element: ReactNode;
}

export const Route: React.FC<RouteProps> = () => null;

export interface RoutesProps {
  children: ReactNode;
}

export const Routes: React.FC<RoutesProps> = ({ children }) => {
  const { pathname } = useLocation();

  let matchedElement: ReactNode = null;
  let fallbackElement: ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<RouteProps>(child)) return;

    const { path, element } = child.props;
    if (path === '*') {
      fallbackElement = element;
    } else if (path === pathname) {
      matchedElement = element;
    }
  });

  return <>{matchedElement || fallbackElement || null}</>;
};
