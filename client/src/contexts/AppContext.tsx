import { createContext, useContext, useReducer, useEffect } from "react";
import type { User, UserSettings } from "@shared/schema";

interface AppState {
  user: User | null;
  settings: UserSettings | null;
  activeTab: string;
  isOnline: boolean;
  currentLocation: GeolocationPosition | null;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SETTINGS'; payload: UserSettings | null }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_LOCATION'; payload: GeolocationPosition | null };

const initialState: AppState = {
  user: null,
  settings: null,
  activeTab: 'account',
  isOnline: navigator.onLine,
  currentLocation: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'SET_LOCATION':
      return { ...state, currentLocation: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Monitor online status
  useEffect(() => {
    function handleOnline() {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    }

    function handleOffline() {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
